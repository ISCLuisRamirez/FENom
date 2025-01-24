import { CoreMenu } from '@core/types';

//? DOC: http://localhost:7777/demo/vuexy-angular-admin-dashboard-template/documentation/guide/development/navigation-menus.html#interface

export const menu: CoreMenu[] = [
  // Dashboard
  {
    id: 'inicio',
    title: 'Inicio',
    type: 'item',
    /* role: ['User','Capturista','Comite'], */
    url:'miscellaneous/final-index'
  },
  {
    id: 'crear_denuncia',
        title: 'Crear Denuncia',
        type: 'item',
        /* role: ['User','Capturista'],  */
        url: 'forms/form-wizard'
  },
  {
    id: 'solicitudes',
    title: 'Solicitudes',
    type: 'item',
    /* role:['Comite'], */
    url: 'tables/datatables'
  },

  {
    id: 'consultar_estatus',
        title: 'Consultar estatus',
        /* role: ['User','Capturista'], */
        type: 'item',
        url: 'pages/pricing'
  },
  
  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    /* role: ['User','Capturista'], */
    type: 'item',
    url: 'pages/faq'
  }
];
