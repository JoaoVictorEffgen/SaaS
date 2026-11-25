const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Agendamento,
  Servico,
  Promocao,
  PacotePersonalizado,
  ContratoPacote
} = require('../models');

/**
 * Remove uma filial e os registros que apontam para ela numa única transação.
 * Sem isso, Agendamento.destroy() pode persistir e empresa.destroy() falhar
 * por FK de serviços/promoções/pacotes — a filial continua no ar sem agenda.
 */
async function deleteNetworkBranch({ empresa, rede }) {
  if (!empresa || !rede) {
    throw new Error('Empresa e rede são obrigatórios para excluir a filial');
  }

  return sequelize.transaction(async (transaction) => {
    const empresaId = empresa.id;

    const funcionarios = await User.findAll({
      where: {
        empresa_id: empresaId,
        tipo: 'funcionario'
      },
      transaction
    });

    for (const funcionario of funcionarios) {
      await funcionario.update({
        empresa_id: null,
        rede_id: rede.id
      }, { transaction });
    }

    await ContratoPacote.destroy({
      where: {
        [Op.or]: [
          { empresa_contratante_id: empresaId },
          { empresa_vendedora_id: empresaId }
        ]
      },
      transaction
    });
    await PacotePersonalizado.destroy({ where: { empresa_id: empresaId }, transaction });
    await Promocao.destroy({ where: { empresa_id: empresaId }, transaction });
    await Servico.destroy({ where: { empresa_id: empresaId }, transaction });
    await Agendamento.destroy({ where: { empresa_id: empresaId }, transaction });
    await empresa.destroy({ transaction });

    const currentCount = Number(rede.empresas_ativas) || 0;
    await rede.update({
      empresas_ativas: Math.max(0, currentCount - 1)
    }, { transaction });

    return { funcionariosRemovidos: funcionarios.length };
  });
}

module.exports = { deleteNetworkBranch };
