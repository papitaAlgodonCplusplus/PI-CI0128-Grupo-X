import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Register from "../src/pages/Register.jsx"
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
module.exports = 'test-file-stub';

const app = require('../../api/index.js');
let agent;

beforeAll(() => {
    agent = require('supertest').agent(app);
});

const resetFormFields = () => {
  render(<Register />);
  fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Apellidos:'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico:'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña:'), { target: { value: '' } });
};

afterEach(() => {
  cleanup();
})

beforeEach(() => {
  jest.clearAllMocks();
});

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('axios')

test('password does not follow the requierments', async () => {
  // Mock the navigate function
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  resetFormFields();

  // Fill out the form fields
  fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Apellidos:'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico:'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: 'invalid' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña:'), { target: { value: 'invalid' } });

  fireEvent.click(screen.getByText('Crear cuenta'));

  // Must not do any axios.post calls
  await waitFor(async () => {
    expect(axios.post).not.toHaveBeenCalled();
  });
});

test('successful registration', async () => {
  // Mock the navigate function
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  resetFormFields();

  // Fill out the form fields
  fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Apellidos:'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico:'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: 'Apassword123' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña:'), { target: { value: 'Apassword123' } });

  fireEvent.click(screen.getByText('Crear cuenta'));

  // Wait for the registration to complete
  await waitFor(async () => {
    // Verify that axios.post was called with the correct URL and data 
    expect(axios.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
  });

  // Verify that the navigate function was called with the correct path
  expect(navigate).toHaveBeenCalledWith('/');
});

test('passwords do not match', async () => {
  // Mock the navigate function
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  resetFormFields();

  // Fill out the form fields
  fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Apellidos:'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico:'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: 'validPassword123' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña:'), { target: { value: 'validPassword124' } });

  fireEvent.click(screen.getByText('Crear cuenta'));

  // Must not do any axios.post calls
  await waitFor(async () => {
    expect(axios.post).not.toHaveBeenCalled();
  });
});

test('invalid email', async () => {
  // Mock the navigate function
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  resetFormFields();

  // Fill out the form fields
  fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Apellidos:'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico:'), { target: { value: 'not_valid_email' } });
  fireEvent.change(screen.getByLabelText('Contraseña:'), { target: { value: 'validPassword123' } });
  fireEvent.change(screen.getByLabelText('Confirmar contraseña:'), { target: { value: 'validPassword123' } });

  fireEvent.click(screen.getByText('Crear cuenta'));

  // Must not do any axios.post calls
  await waitFor(async () => {
    expect(axios.post).not.toHaveBeenCalled();
  });
});

test('POST /register', async () => {
  const req = {
    name: 'John',
    email: 'john@example.com',
    last_name: 'Doe',
    password: 'password123',
    rol: 'user',
  };

  const response = await agent
    .post('/api/auth/register')
    .send(req)
    .expect(200)

  // Check if the user has been created successfully
  expect(response.status).toBe(200);
});


test('DELETE /', async () => {
  const email = 'john@example.com'
  const response = await agent
    .delete(`/api/auth/${email}`)
    .expect(200);

  // Check if the user has been created successfully
  expect(response.status).toBe(200);
});