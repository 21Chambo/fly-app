import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  employees: any[] = [];
  isLoading = false;
  error: string | null = null;
  lastUpdate: Date | null = null;

  constructor(private http: HttpClient) {}

  ionViewDidEnter() {
    this.loadEmployees();
  }

  async loadEmployees() {
    this.isLoading = true;
    this.error = null;

    try {
      // Intentar conectar al backend
      const response = await this.http.get<any[]>('http://localhost:8081/api/locations/active').toPromise();
      this.employees = response || [];
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Error loading employees:', error);
      this.error = 'Backend no disponible. Mostrando datos de prueba.';
      
      // Datos de prueba para demostrar el sistema
      this.employees = [
        {
          employeeId: 1,
          employeeName: 'Juan Pérez',
          role: 'DELIVERY_PERSON',
          latitude: 19.4326,
          longitude: -99.1332,
          accuracy: 5,
          timestamp: new Date().toISOString(),
          batteryLevel: 85,
          withinPerimeter: true
        },
        {
          employeeId: 2,
          employeeName: 'María García',
          role: 'SUPERVISOR',
          latitude: 19.4350,
          longitude: -99.1380,
          accuracy: 8,
          timestamp: new Date(Date.now() - 30000).toISOString(),
          batteryLevel: 92,
          withinPerimeter: false
        },
        {
          employeeId: 3,
          employeeName: 'Carlos López',
          role: 'EMPLOYEE',
          latitude: 19.4320,
          longitude: -99.1325,
          accuracy: 3,
          timestamp: new Date(Date.now() - 15000).toISOString(),
          batteryLevel: 67,
          withinPerimeter: true
        }
      ];
      this.lastUpdate = new Date();
    } finally {
      this.isLoading = false;
    }
  }

  async refresh() {
    await this.loadEmployees();
  }
}
