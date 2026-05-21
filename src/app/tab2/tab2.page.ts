import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../services/carrito.service';
import { PedidoService } from '../services/pedido.service';
import { ItemCarrito } from '../models/carrito.model';
import { PedidoResponse } from '../models/pedido.model';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  items: ItemCarrito[] = [];
  pedidoConfirmado: PedidoResponse | null = null;
  numeroMesa: number | null = null;

  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.carritoService.items$.subscribe(items => {
      this.items = items;
      this.pedidoConfirmado = null;
    });
  }

  get total(): number {
    return this.carritoService.getTotal();
  }

  aumentar(item: ItemCarrito) {
    this.carritoService.agregar(item.producto);
  }

  disminuir(item: ItemCarrito) {
    this.carritoService.quitar(item.producto.id);
  }

  eliminar(item: ItemCarrito) {
    this.carritoService.eliminar(item.producto.id);
  }

  async confirmarPedido() {
    if (this.items.length === 0) return;

    const mesa = Number(this.numeroMesa);
    if (!mesa || mesa < 1) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor ingresa el número de mesa',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar pedido',
      message: `Mesa ${mesa} — Total: $${this.total.toFixed(2)}. ¿Deseas confirmar?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => this.enviarPedido() }
      ]
    });
    await alert.present();
  }

  async enviarPedido() {
    const loading = await this.loadingCtrl.create({ message: 'Enviando pedido...' });
    await loading.present();

    const request = {
      items: this.items.map(i => ({
        productoId: i.producto.id,
        cantidad: i.cantidad
      })),
      numeroMesa: Number(this.numeroMesa)
    };

    this.pedidoService.crear(request).subscribe({
      next: async (pedido) => {
        await loading.dismiss();
        this.pedidoConfirmado = pedido;
        this.numeroMesa = null;
        this.carritoService.limpiar();
        const toast = await this.toastCtrl.create({
          message: `¡Pedido para mesa ${pedido.numeroMesa} realizado con éxito!`,
          duration: 2500,
          color: 'success'
        });
        toast.present();
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Error al enviar el pedido. Intenta de nuevo.',
          duration: 2500,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
