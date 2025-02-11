import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class ApiService {
  private apiUrl = 'http://localhost:5101';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/roles`); 
  }

  enviarDenuncia(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/requests`, data);
  }

  guardarSolicitante(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/requesters`, data);
  }

  guardarInvolucrado(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/subjects`, data);
  }

  guardarTestigo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/witness`, data);
  }

  subirArchivo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/upload`, formData, {
      reportProgress: true, 
      responseType: 'json', 
    });
  }

  getLocations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/locations`);
  }

  getLocationById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/locations/${id}`);
  }

  getSublocations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sublocations`);
  }
  
  getSublocationById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sublocations/${id}`);
  }

  getRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/requests`);
  }

  getRequestById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/requests/${id}`);
  }

  updateRequest(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/requests/${id}`, data);
  }

  // obtener un solicitante por ID (GET)
  getRequesterById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/requesters/${id}`);
  }
  //obtener todos los involucrados (GET)
  getSubjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/subjects`);
  }

  //obtener un involucrado por ID (GET)
  getSubjectById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/subjects/${id}`);
  }

  // obtener un testigo por ID (GET)
  getWitnessById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/witness/${id}`);
  }

  // Método para iniciar sesión (POST)
  login(employee_number: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { employee_number, password });
  }
}