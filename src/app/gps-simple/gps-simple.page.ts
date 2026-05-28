import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gps-simple',
  templateUrl: './gps-simple.page.html',
  styleUrls: ['./gps-simple.page.scss']
})
export class GPSSimplePage implements OnInit {
  employees: any[] = [];
  isLoading = false;
  error: string | null = null;
  lastUpdate: Date | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEmployees();
  }

  async loadEmployees() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.http.get<any[]>('http://localhost:8081/api/locations/active').toPromise();
      this.employees = response || [];
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Error loading employees:', error);
      this.error = 'Error al cargar ubicaciones. Verifica que el backend esté funcionando.';
    } finally {
      this.isLoading = false;
    }
  }

  async refresh() {
    await this.loadEmployees();
  }
}