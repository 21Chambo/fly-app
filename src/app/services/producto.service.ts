import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private api: ApiService) {}

  listarTodos(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  listarPorCategoria(categoriaId: number): Observable<Producto[]> {
    return this.api.get<Producto[]>(`/productos?categoriaId=${categoriaId}`);
  }

  buscarPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`/productos/${id}`);
  }
}
