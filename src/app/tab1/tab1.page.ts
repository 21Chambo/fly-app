import { Component, OnInit } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { Producto } from '../models/producto.model';
import { CategoriaService } from '../services/categoria.service';
import { ProductoService } from '../services/producto.service';
import { CarritoService } from '../services/carrito.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  categoriaSeleccionada: number | null = null;
  cargando = true;

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarCategorias();
    setTimeout(() => this.cargarProductos(), 300);
  }

  cargarCategorias() {
    this.categoriaService.listar().subscribe(data => {
      this.categorias = data;
    });
  }

  cargarProductos(categoriaId?: number) {
    this.cargando = true;
    const obs = categoriaId
      ? this.productoService.listarPorCategoria(categoriaId)
      : this.productoService.listarTodos();

    obs.subscribe({
      next: data => {
        this.productos = data;
        this.cargando = false;
      },
      error: async (err) => {
        this.cargando = false;
        const toast = await this.toastCtrl.create({
          message: `Error: ${err.status} - ${err.message}`,
          duration: 5000,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }

  filtrarPorCategoria(id: number | null) {
    this.categoriaSeleccionada = id;
    if (id === null) {
      this.cargarProductos();
    } else {
      this.cargarProductos(id);
    }
  }

  async agregarAlCarrito(producto: Producto) {
    this.carritoService.agregar(producto);
    const toast = await this.toastCtrl.create({
      message: `${producto.nombre} agregado al carrito`,
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}
