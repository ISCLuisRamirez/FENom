import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Disponible en toda la aplicación
})
export class ApiService {
  private apiUrl = 'http://localhost:5101'; // Reemplázalo con tu API

  constructor(private http: HttpClient) {}

  // Método para obtener roles (GET)
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/roles`); //Obtiene los datos de los roles.
  }

  getdatosgrafica(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/requests/counter`); //Obtiene los datos de los roles.
  }

  // Método para enviar datos a mi tabla requests (Solicitudes)
  enviarDenuncia(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/requests`, data);
  }
  // Método para guardar los datos en `requesters` del denunciante.
  enviarDatosPersonales(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/requesters`, data);
  }

  // Método para guardar los datos en `witnesses`.(Testigos)
  enviarDatosInv(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/subjects`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  enviarDatosWit(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/witnesses`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getInvolucrados(id_request: number) {
    return this.http.get<any[]>(`${this.apiUrl}/api/subjects`, { params: { id_request: id_request.toString() } });
  }
  
  
  getTestigos(id_request: number) {
    return this.http.get<any[]>(`${this.apiUrl}/api/witnesses`, { params: { id_request: id_request.toString() } });
  }

  //Get para obtener informacion filtrada
  getSolicitanteInfoFiltrado(data: any ): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/requesters?id_request=`+ data);
  }
 
  // Método para enviar datos (POST)
  crearDato(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/datos`, data);
  }

  login(employee_number: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { employee_number, password });
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
