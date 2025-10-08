import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MesasApiService } from '../../core/services/mesas-api.service';
import { MesaDto } from '../../core/models/mesa.models';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent implements OnInit {
  mesas = signal<MesaDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private mesasApi: MesasApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.mesasApi.listar().subscribe({
      next: (res) => {
        this.mesas.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las mesas');
        this.loading.set(false);
      }
    });
  }
}
