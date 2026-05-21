import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  cantidadCarrito = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.items$.subscribe(items => {
      this.cantidadCarrito = items.reduce((sum, i) => sum + i.cantidad, 0);
    });
  }
}
