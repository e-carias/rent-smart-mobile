/**
 * Ruta de entrada.
 *
 * No dibuja nada: solo manda al usuario al lugar que le corresponde. El
 * guardia del layout raíz ya hizo la decisión; esta pantalla existe para que
 * abrir la app en "/" nunca deje una vista en blanco.
 */

import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexto/AuthContext';

export default function Entrada() {
  const { autenticado } = useAuth();
  return <Redirect href={autenticado ? '/(tabs)/inicio' : '/login'} />;
}
