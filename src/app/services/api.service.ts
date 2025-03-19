import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { NumberFormatStyle } from '@angular/common';

@Injectable({
  providedIn: 'root', // Disponible en toda la aplicación
})
export class ApiService {

  constructor(private http: HttpClient) {}

  // Método para obtener roles (GET)
  getRoles(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/roles`); //Obtiene los datos de los roles.
  }

  getdatosgrafica(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/requests/counter`); //Obtiene los datos de los roles.
  }

  // Método para enviar datos a mi tabla requests (Solicitudes)
  enviarDenuncia(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/requests`, data);
  }
  // Método para guardar los datos en `requesters` del denunciante.
  enviarDatosPersonales(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/requesters`, data);
  }

  // Método para guardar los datos en `witnesses`.(Testigos)
  enviarDatosInv(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/subjects`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  enviarDatosWit(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/witnesses`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getInvolucrados(id_request: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/subjects`, { params: { id_request: id_request.toString() } });
  }
  
  
  getTestigos(id_request: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/witnesses`, { params: { id_request: id_request.toString() } });
  }

  getSolicitanteInfoFiltrado(data: any ): Observable<any> {
    return this.http.get(`${environment.apiUrl}/requesters?id_request=`+ data);
  }
 
  crearDato(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/datos`, data);
  }

  login(employee_number: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, { employee_number, password });
  }
  
  actualizarDato(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/datos/${id}`, data);
  }

  eliminarDato(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/datos/${id}`);
  }

  uploadFile(file: File, idRequest: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('id_request', idRequest.toString());
    return this.http.post(`${environment.apiUrl}/files/upload`, formData);
  }

  getFile(idRequest: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/files/get/${idRequest}`);
  }

  // En api.service.ts
  Viewfile(fileId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/files/${fileId}`, {
      responseType: 'blob'
    });
  }
}
