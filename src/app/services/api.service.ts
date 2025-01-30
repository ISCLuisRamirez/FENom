import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Disponible en toda la aplicación
})
export class ApiService {
  private apiUrl = 'http://localhost:5101'; // Reemplázalo con tu API

  constructor(private http: HttpClient) {}

  // Método para obtener datos (GET)
  getDatos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`); //End points se ponen en plural y en minusculas.
  }

  // Método para enviar datos (POST)
  crearDato(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/datos`, data);
  }

  // Método para actualizar datos (PUT)
  actualizarDato(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/datos/${id}`, data);
  }

  // Método para eliminar datos (DELETE)
  eliminarDato(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/datos/${id}`);
  }
}
