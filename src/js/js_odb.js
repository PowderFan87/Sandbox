/**********************************************************************
 * Copyright (c) 2010 Holger Szuesz, <hszuesz@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *********************************************************************/

/**
 * JavaScript object data base for HTML5 webDB
 *
 */
function odb(conf) {
    this.conf       = conf;
    this.db         = null;
    this.debug      = false;
    this.prepared   = {};

    this.init   = function() {
        if(this.conf.database.debug === true) {
            this.debug = true;
        }

        this.db = openDatabase(this.conf.database.name,this.conf.database.version,this.conf.database.description,this.conf.database.size);

        if(this.db === null){
            throw "error in init";
        }

        statements = [];
        for(i in this.conf.database.tables) {
            sql = 'CREATE TABLE IF NOT EXISTS ' + i + '(uid unique';

            for(x in this.conf.database.tables[i].fieldlist) {
                if(this.conf.database.tables[i].fieldlist[x].name == 'uid') {
                    continue;
                }

                sql += ', ' + this.conf.database.tables[i].fieldlist[x].name;
                if(this.conf.database.tables[i].fieldlist[x].conf !== null) {
                    sql += ' ' + this.conf.database.tables[i].fieldlist[x].conf;
                }
            }

            sql += ')';

            statements.push(sql);
        }

        this.db.transaction(function(tx) {
            for(i in statements) {
                tx.executeSql(statements[i]);
            }
        }, function(err) {
            if(this.debug && window.console) {
                window.console.log(err);
            }

            return false;
        });

        for(i in this.conf.database.tables) {
            insert      = 'INSERT INTO ' + i + ' (';
            update      = 'UPDATE ' + i + ' SET uid = uid';
            insertlist  = 'uid';
            valuelist   = '?';

            for(x in this.conf.database.tables[i].fieldlist) {
                if(this.conf.database.tables[i].fieldlist[x].name == 'uid') {
                    continue;
                }

                insertlist  += ', ' + this.conf.database.tables[i].fieldlist[x].name;
                valuelist   += ', ?';
                update      += ', ' + this.conf.database.tables[i].fieldlist[x].name + ' = ?';
            }

            this.prepared[i] = {
                'insert' : insert + insertlist + ') VALUES (' + valuelist + ')',
                'update' : update + ' WHERE ',
                'delere' : 'DELETE * FROM ' + i + ' WHERE ',
                'select' : 'SELECT * FROM ' + i + ' WHERE '
            }
        }

        return true;
    };

    /**
     * Insert methode to insert data into webDB table
     *
     * @param   table
     * @param   data
     */
    this.insert = function(table, data) {
        sql = this.prepared[table].insert;

        if(sql === '') {
            throw "unknown table '" + table + "'";
        }

        this.db.transaction(function(tx) {
            for(i in data) {
                tx.executeSql(sql, data[i]);
            }
        }, function(err) {
            if(this.debug && window.console) {
                window.console.log(err);
            }

            return false;
        });

        return true;
    };

    /**
     * Update methode to update data in webDB table
     *
     * @param   table
     * @param   data
     * @param   where
     */
    this.update = function(table, data, where) {
        sql = this.prepared[table].update;

        if(sql === '') {
            throw "unknown table '" + table + "'";
        }

        this.db.transaction(function(tx) {
            for(i in data) {
                tx.executeSql(sql + where[i], data[i]);
            }
        }, function(err) {
            if(this.debug && window.console) {
                window.console.log(err);
            }

            return false;
        });

        return true;
    };

    /**
     * Select methode to select data from webDB table
     *
     * @param   table
     * @param   where
     *
     * @return  json
     */
    this.select = function(table, where) {
        result = [];

        this.db.transaction(function(tx){
            tx.executeSql(this.prepared[table].select + where, [], function (tx, results) {
                len = results.rows.length;

                for (i=0;i<len;i++) {
                    result[i] = results.rows.item(i);
                }
            });
        }, function(err) {
            if(this.debug && window.console) {
                window.console.log(err);
            }

            return false;
        });

        return result;
    };
}