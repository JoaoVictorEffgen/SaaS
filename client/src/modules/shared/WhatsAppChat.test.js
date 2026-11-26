import { render, screen } from '@testing-library/react';
import WhatsAppChat, { getCompanyChatLabel, getCompanyWhatsAppDigits } from './WhatsAppChat';

describe('WhatsAppChat', () => {
  it('usa nome da vitrine quando razaoSocial não existe', () => {
    expect(getCompanyChatLabel({ nome: 'Salão Beleza Demo' })).toBe('Salão Beleza Demo');
  });

  it('não quebra com empresa vazia', () => {
    expect(getCompanyChatLabel(undefined)).toBe('Empresa');
    expect(getCompanyWhatsAppDigits(undefined)).toBe('');
  });

  it('lê o WhatsApp no campo retornado pela API', () => {
    expect(getCompanyWhatsAppDigits({ whatsapp: '(11) 99999-0001' })).toBe('11999990001');
    expect(getCompanyWhatsAppDigits({ whatsapp_contato: '11988887777' })).toBe('11988887777');
  });

  it('renderiza o chat da página de agendamento sem razaoSocial', () => {
    render(
      <WhatsAppChat
        empresa={{ id: 1, nome: 'Salão Beleza Demo', whatsapp: '11999990001' }}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Salão Beleza Demo')).toBeTruthy();
    expect(screen.getByText(/Inicie uma conversa com Salão Beleza Demo/)).toBeTruthy();
  });
});
