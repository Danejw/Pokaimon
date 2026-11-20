import { createAppServer } from './agui';
const port=Number(process.env.AG_UI_PORT ?? '8787');
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid AG_UI_PORT');
createAppServer().listen(port,'127.0.0.1',()=>console.info('Pokaimon AG-UI simulation listening on http://127.0.0.1:'+port+'/api/agui'));
