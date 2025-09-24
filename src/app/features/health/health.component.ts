import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [JsonPipe], // <-- necesario para el pipe | json
  template: `<h2>Backend health</h2><pre>{{ data | json }}</pre>`
})
export class HealthComponent implements OnInit {
  private http = inject(HttpClient);
  data: any;

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/actuator/health`)
      .subscribe({
        next: r => this.data = r,
        error: err => this.data = err?.error ?? err?.message
      });
  }
}
