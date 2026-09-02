'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users');
    const appointments = await queryInterface.describeTable('agendamentos');
    const companies = await queryInterface.describeTable('empresas');

    if (!users.disponibilidade) {
      await queryInterface.addColumn('users', 'disponibilidade', {
        type: Sequelize.JSON,
        allowNull: true
      });
    }
    if (!users.pausas) {
      await queryInterface.addColumn('users', 'pausas', {
        type: Sequelize.JSON,
        allowNull: true
      });
    }
    if (!users.plano) {
      await queryInterface.addColumn('users', 'plano', {
        type: Sequelize.ENUM('free', 'pro', 'business'),
        allowNull: false,
        defaultValue: 'free'
      });
    }
    if (!appointments.servicos) {
      await queryInterface.addColumn('agendamentos', 'servicos', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      });
    }
    if (!companies.categoria) {
      await queryInterface.addColumn('empresas', 'categoria', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    const dialect = queryInterface.sequelize.getDialect();
    for (const table of ['servicos', 'agendamentos']) {
      const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(table);
      const companyForeignKey = foreignKeys.find((foreignKey) =>
        ['empresa_id', 'empresaId'].includes(foreignKey.columnName)
      );
      const legacyReference = String(companyForeignKey?.referencedTableName || '').toLowerCase() === 'users';

      if (dialect === 'mysql') {
        await queryInterface.sequelize.query(`
          UPDATE ${table} AS item
          INNER JOIN empresas AS empresa ON empresa.user_id = item.empresa_id
          SET item.empresa_id = empresa.id
          ${legacyReference ? '' : 'WHERE NOT EXISTS (SELECT 1 FROM empresas AS current_empresa WHERE current_empresa.id = item.empresa_id)'}
        `);
      } else if (dialect === 'sqlite') {
        await queryInterface.sequelize.query(`
          UPDATE ${table}
          SET empresa_id = (SELECT id FROM empresas WHERE user_id = ${table}.empresa_id LIMIT 1)
          WHERE EXISTS (SELECT 1 FROM empresas WHERE user_id = ${table}.empresa_id)
          ${legacyReference ? '' : `AND NOT EXISTS (SELECT 1 FROM empresas WHERE id = ${table}.empresa_id)`}
        `);
      }
    }

    await queryInterface.changeColumn('servicos', 'empresa_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'empresas', key: 'id' }
    });
    await queryInterface.changeColumn('agendamentos', 'empresa_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'empresas', key: 'id' }
    });
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users');
    const appointments = await queryInterface.describeTable('agendamentos');
    const companies = await queryInterface.describeTable('empresas');
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'mysql') await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    if (dialect === 'sqlite') await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF');
    try {
      for (const table of ['servicos', 'agendamentos']) {
        if (dialect === 'mysql') {
          await queryInterface.sequelize.query(`
            UPDATE ${table} AS item
            INNER JOIN empresas AS empresa ON empresa.id = item.empresa_id
            SET item.empresa_id = empresa.user_id
          `);
        } else if (dialect === 'sqlite') {
          await queryInterface.sequelize.query(`
            UPDATE ${table}
            SET empresa_id = (SELECT user_id FROM empresas WHERE id = ${table}.empresa_id LIMIT 1)
            WHERE EXISTS (SELECT 1 FROM empresas WHERE id = ${table}.empresa_id)
          `);
        }
        await queryInterface.changeColumn(table, 'empresa_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        });
      }
    } finally {
      if (dialect === 'mysql') await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      if (dialect === 'sqlite') await queryInterface.sequelize.query('PRAGMA foreign_keys = ON');
    }

    if (appointments.servicos) await queryInterface.removeColumn('agendamentos', 'servicos');
    if (users.plano) await queryInterface.removeColumn('users', 'plano');
    if (users.pausas) await queryInterface.removeColumn('users', 'pausas');
    if (users.disponibilidade) await queryInterface.removeColumn('users', 'disponibilidade');
    if (companies.categoria) await queryInterface.removeColumn('empresas', 'categoria');
  }
};
