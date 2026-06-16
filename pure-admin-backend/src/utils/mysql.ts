import * as mysql from "mysql2";
import mysqlConfig from "../config";
import Logger from "../loaders/logger";

/** user数据库 */
export const connection = mysql.createConnection(
  Object.assign({ database: "cs13" }, mysqlConfig.mysql)
);

export function queryTable(s: string): void {
  connection.query(s, (err) => {
    if (err) Logger.error(err);
  });
}
