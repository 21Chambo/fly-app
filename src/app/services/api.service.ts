import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    const url = `${environment.apiUrl}${path}`;

    if (Capacitor.isNativePlatform()) {
      return from(
        CapacitorHttp.request({
          method: 'GET',
          url,
          headers: { 'Accept': 'application/json' }
        })
      ).pipe(
        map(res => {
          if (typeof res.data === 'string') {
            return JSON.parse(res.data) as T;
          }
          return res.data as T;
        })
      );
    }

    return this.http.get<T>(url);
  }

  post<T>(path: string, body: any): Observable<T> {
    const url = `${environment.apiUrl}${path}`;

    if (Capacitor.isNativePlatform()) {
      return from(
        CapacitorHttp.request({
          method: 'POST',
          url,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          data: body
        })
      ).pipe(
        map(res => {
          if (typeof res.data === 'string') {
            return JSON.parse(res.data) as T;
          }
          return res.data as T;
        })
      );
    }

    return this.http.post<T>(url, body);
  }
}
