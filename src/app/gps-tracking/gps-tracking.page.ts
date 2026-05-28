import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface EmployeeLocation {
  employeeId: number;
  employeeName: string;
  role: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  batteryLevel?: number;
  withinPerimeter: boolean;
  lastUpdate: string;
}

@Component({
  selector: 'app-gps-tracking',
  templateUrl: './gps-tracking.page.html',
  styleUrls: ['./gps-tracking.page.scss']
})
export class GPSTrackingPage implements OnInit, OnDestroy {
  employeeLocations: EmployeeLocation[] = [];
  isLoading = false;
  error: string | null = null;
  lastUpdate: Date | null = null;
  
  // Restaurant location (hardcoded for MVP)
  restaurantLocation = {
    latitude: 19.4326,
    longitude: -99.1332,
    name: 'Restaurante MAGA'
  };

  private updateSubscription?: Subscription;
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadEmployeeLocations();
    this.startAutoUpdate();
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
  }

  async loadEmployeeLocations() {
    this.isLoading = true;
    this.error = null;

    try {
      const locations = await this.apiService.get<EmployeeLocation[]>('/locations/active').toPromise();
      this.employeeLocations = locations || [];
      this.lastUpdate = new Date();
      console.log('Loaded employee locations:', this.employeeLocations);
    } catch (error) {
      console.error('Error loading employee locations:', error);
      this.error = 'Error al cargar ubicaciones de empleados';
    } finally {
      this.isLoading = false;
    }
  }

  startAutoUpdate() {
    // Update every 30 seconds
    this.updateSubscription = interval(this.UPDATE_INTERVAL)
      .pipe(
        switchMap(() => this.apiService.get<EmployeeLocation[]>('/locations/active'))
      )
      .subscribe({
        next: (locations) => {
          this.employeeLocations = locations || [];
          this.lastUpdate = new Date();
          this.error = null;
        },
        error: (error) => {
          console.error('Error in auto-update:', error);
          this.error = 'Error en actualización automática';
        }
      });
  }

  stopAutoUpdate() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = undefined;
    }
  }

  async refresh() {
    await this.loadEmployeeLocations();
  }

  getEmployeeIcon(role: string): string {
    switch (role) {
      case 'DELIVERY_PERSON':
        return 'bicycle';
      case 'SUPERVISOR':
        return 'person-circle';
      default:
        return 'person';
    }
  }

  getEmployeeColor(role: string): string {
    switch (role) {
      case 'DELIVERY_PERSON':
        return 'success';
      case 'SUPERVISOR':
        return 'warning';
      default:
        return 'primary';
    }
  }

  getStatusColor(withinPerimeter: boolean): string {
    return withinPerimeter ? 'success' : 'medium';
  }

  getStatusText(withinPerimeter: boolean): string {
    return withinPerimeter ? 'En restaurante' : 'Fuera del restaurante';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getDistanceToRestaurant(location: EmployeeLocation): number {
    return this.calculateDistance(
      this.restaurantLocation.latitude,
      this.restaurantLocation.longitude,
      location.latitude,
      location.longitude
    );
  }
}