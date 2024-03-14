import { Sequelize, STRING } from 'sequelize';

const sequelize = new Sequelize('database', 'editor', 'XWZTxLn4yqDhUgBmPwp5sb', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'database.sqlite',
});

export const Config = sequelize.define('config', {
  objectId: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
  mainLeagueIds: {
    type: STRING,
    set(val: number[]) {
      this.setDataValue('mainLeagueIds', val.join(';'));
    },
    get() {
      const val = this.getDataValue('mainLeagueIds');
      return val ? val.split(';') : [];
    },
  },
  chalLeagueIds: {
    type: STRING,
    set(val: number[]) {
      this.setDataValue('chalLeagueIds', val.join(';'));
    },
    get() {
      const val = this.getDataValue('chalLeagueIds');
      return val ? val.split(';') : [];
    },
  },
});
