import { Component } from '@angular/core';
import { PedidoResponse } from '../models/pedido.model';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: 'pedidos.page.html',
  styleUrls: ['pedidos.page.scss'],
  standalone: false,
})
export class PedidosPage {
  pedidos: PedidoResponse[] = [];
  cargando = true;
  error = '';

  constructor(private api: ApiService) {}

  ionViewWillEnter() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.error = '';
    this.api.get<PedidoResponse[]>('/pedidos').subscribe({
      next: data => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los pedidos';
        this.cargando = false;
      }
    });
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'EN_PREPARACION': return 'primary';
      case 'ENTREGADO': return 'success';
      default: return 'medium';
    }
  }
}
