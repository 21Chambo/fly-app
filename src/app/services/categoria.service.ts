import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  constructor(private api: ApiService) {}

  listar(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/categorias');
  }
}
