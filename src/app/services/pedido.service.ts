import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse } from '../models/pedido.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private api: ApiService) {}

  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.api.post<PedidoResponse>('/pedidos', request);
  }

  buscarPorId(id: number): Observable<PedidoResponse> {
    return this.api.get<PedidoResponse>(`/pedidos/${id}`);
  }
}
