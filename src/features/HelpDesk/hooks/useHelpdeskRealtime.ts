import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketService } from '../../../shared/utils/WebsocketService';

export const useHelpdeskRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsService = getWebSocketService();

    wsService.connect().then(() => {
      // Subscribe ke channel global
      wsService.subscribe('helpdesk-global');

      const unsubscribe = wsService.onMessage('helpdesk-global', (data) => {
        if (data && data.event === 'helpdesk_status_changed') {
          console.log(`Pembaruan Helpdesk: Sesi ${data.session_id} menjadi ${data.status}`);
          
          // 1. Refetch list chat di sidebar agar pindah tab seketika (Aktif/Antrean/Selesai)
          queryClient.invalidateQueries({ queryKey: ["helpdesks", "infinite"] });
          queryClient.invalidateQueries({ queryKey: ["helpdesks"] });

          // 2. Refetch chat spesifik agar tombol (Hubungkan / Selesaikan) berubah bagi agen yang sedang melihatnya
          if (data.session_id) {
             queryClient.invalidateQueries({ queryKey: ["helpdesk-session", data.session_id] });
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }).catch(console.error);
    
  }, [queryClient]);
};