import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface GPSStatus {
  isTracking: boolean;
  hasPermission: boolean;
  lastLocation?: LocationData;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GPSService {
  private statusSubject = new BehaviorSubject<GPSStatus>({
    isTracking: false,
    hasPermission: false
  });

  public status$ = this.statusSubject.asObservable();
  private trackingInterval?: number;

  constructor() {
    this.checkPermissions();
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      const hasPermission = permissions.location === 'granted';
      
      this.updateStatus({ hasPermission });
      return hasPermission;
    } catch (error) {
      console.error('Error checking GPS permissions:', error);
      this.updateStatus({ hasPermission: false, error: 'Error checking permissions' });
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions();
      const hasPermission = permissions.location === 'granted';
      
      this.updateStatus({ hasPermission });
      return hasPermission;
    } catch (error) {
      console.error('Error requesting GPS permissions:', error);
      this.updateStatus({ hasPermission: false, error: 'Permission denied' });
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('GPS permission denied');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
      };

      this.updateStatus({ lastLocation: locationData });
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      const errorMessage = this.getErrorMessage(error);
      this.updateStatus({ error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  startTracking(intervalSeconds: number = 30): void {
    if (this.trackingInterval) {
      this.stopTracking();
    }

    this.updateStatus({ isTracking: true });
    
    // Get initial location
    this.getCurrentLocation().catch(error => {
      console.error('Error getting initial location:', error);
    });

    // Set up interval for continuous tracking
    this.trackingInterval = window.setInterval(async () => {
      try {
        await this.getCurrentLocation();
      } catch (error) {
        console.error('Error during tracking:', error);
      }
    }, intervalSeconds * 1000);
  }

  stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = undefined;
    }
    this.updateStatus({ isTracking: false });
  }

  isTrackingActive(): boolean {
    return this.statusSubject.value.isTracking;
  }

  getLastKnownLocation(): LocationData | undefined {
    return this.statusSubject.value.lastLocation;
  }

  private updateStatus(updates: Partial<GPSStatus>): void {
    const currentStatus = this.statusSubject.value;
    this.statusSubject.next({ ...currentStatus, ...updates });
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }

    // Common GPS error codes
    switch (error?.code) {
      case 1:
        return 'GPS permission denied';
      case 2:
        return 'GPS position unavailable';
      case 3:
        return 'GPS timeout - please try again';
      default:
        return 'GPS error occurred';
    }
  }
}