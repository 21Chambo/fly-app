import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrito } from '../models/carrito.model';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items: ItemCarrito[] = [];
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);

  items$ = this.itemsSubject.asObservable();

  agregar(producto: Producto) {
    const existente = this.items.find(i => i.producto.id === producto.id);
    if (existente) {
      existente.cantidad++;
    } else {
      this.items.push({ producto, cantidad: 1 });
    }
    this.itemsSubject.next([...this.items]);
  }

  quitar(productoId: number) {
    const idx = this.items.findIndex(i => i.producto.id === productoId);
    if (idx > -1) {
      if (this.items[idx].cantidad > 1) {
        this.items[idx].cantidad--;
      } else {
        this.items.splice(idx, 1);
      }
      this.itemsSubject.next([...this.items]);
    }
  }

  eliminar(productoId: number) {
    this.items = this.items.filter(i => i.producto.id !== productoId);
    this.itemsSubject.next([...this.items]);
  }

  limpiar() {
    this.items = [];
    this.itemsSubject.next([]);
  }

  getItems(): ItemCarrito[] {
    return this.items;
  }

  getTotal(): number {
    return this.items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0);
  }

  getCantidadTotal(): number {
    return this.items.reduce((sum, i) => sum + i.cantidad, 0);
  }
}
