import React from 'react';
import { Edit, Save, User } from 'lucide-react';

const FuncionarioProfileTab = ({
  isEditing,
  onEditingChange,
  profileData,
  onProfileDataChange,
  onSave
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <User className="h-5 w-5 mr-2 text-purple-600" />
        Meu Perfil
      </h2>
      {!isEditing ? (
        <button
          onClick={() => onEditingChange(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Editar Contato</span>
        </button>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => onEditingChange(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </button>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
        <input
          type="text"
          value={profileData.nome || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
        />
        <p className="text-xs text-gray-500 mt-1">Definido pela empresa</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
        <input
          type="text"
          value={profileData.cpf || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
        />
        <p className="text-xs text-gray-500 mt-1">Definido pela empresa</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
        <input
          type="text"
          value={profileData.cargo || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
        />
        <p className="text-xs text-gray-500 mt-1">Definido pela empresa</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
        <input
          type="text"
          value={profileData.telefone || ''}
          onChange={(event) => onProfileDataChange((current) => ({
            ...current,
            telefone: event.target.value.replace(/\D/g, '')
          }))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          maxLength={11}
          placeholder="11999999999"
        />
        <p className="text-xs text-gray-500 mt-1">Você pode alterar seu telefone</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          value={profileData.email || ''}
          onChange={(event) => onProfileDataChange((current) => ({
            ...current,
            email: event.target.value
          }))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="seu@email.com"
        />
        <p className="text-xs text-gray-500 mt-1">Você pode alterar seu email</p>
      </div>
    </div>

    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-sm font-medium text-blue-900 mb-2">Informações Importantes</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Nome, CPF e cargo são definidos pela empresa</li>
        <li>• Você pode alterar apenas telefone e email</li>
        <li>• Seus horários de trabalho são gerenciados pela empresa</li>
        <li>• Mantenha seus dados de contato sempre atualizados</li>
      </ul>
    </div>
  </div>
);

export default FuncionarioProfileTab;

