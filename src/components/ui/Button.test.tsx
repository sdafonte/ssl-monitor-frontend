import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Componente: Button', () => {
  it('Deve renderizar o botão com o texto correto', () => {
    render(<Button>Clique aqui</Button>);
    const buttonElement = screen.getByRole('button', { name: /clique aqui/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('Deve chamar a função onClick quando o botão for clicado', async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    render(<Button onClick={onClickMock}>Salvar</Button>);
    const buttonElement = screen.getByText('Salvar');
    await user.click(buttonElement);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('Deve estar desabilitado quando a prop "disabled" for passada', () => {
    render(<Button disabled>Não pode clicar</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
  });
});