import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';
import { ApiService } from './api.service';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private api: ApiService) {}

  listarTodos(): Observable<Producto[]> {
    return this.api.get<PageResponse<Producto>>('/productos').pipe(
      map(response => response.content)
    );
  }

  listarPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.api.get<PageResponse<Producto>>(`/productos?categoriaId=${categoriaId}`).pipe(
      map(response => response.content)
    );
  }

  buscarPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`/productos/${id}`);
  }
}
