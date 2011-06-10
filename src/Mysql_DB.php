<?php

/* * ******************************************************************
 * Copyright (c) 2009 Holger Szuesz, <hszuesz@gmail.com>
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
 * ***************************************************************** */

/**
 * Mysql Database klasse
 *
 * Mysql Database klasse
 *
 * @author		Holger Szuesz, <hszuesz@gmail.com>
 * @copyright	Copyright(C) 2009, Holger Szuesz, <hszuesz@gmail.com>
 * @since		18.12.2009
 */
class Mysql_DB {
    const           blnDebug        = true;

    private static  $objMysqlDb     = null;
    private         $strHost        = '';
    private         $strUser        = '';
    private         $strPassword    = '';
    private         $resMysqlDB     = null;

    /**
     * get instance of class
     *
     * @param Boolean $blnForce
     * @return Mysql_DB
     */
    public static function getInstance($blnForce = false) {
        if (self::$objMysqlDb == null || $blnForce === true) {
            self::$objMysqlDb = new Mysql_DB();
        }

        return self::$objMysqlDb;
    }

    /**
     * constructor
     *
     */
    private function __construct() {
        if (!Mysql_DB::blnDebug) {
            $this->resMysqlDB = mysql_connect($this->strHost, $this->strUser, $this->strPassword);
        }
    }

    /**
     * no cloning
     *
     */
    private function __clone() {
        //no clone
    }

    /**
     * destructor
     *
     */
    public function __destruct() {
        if (!Mysql_DB::blnDebug) {
            mysql_close($this->resMysqlDB);
        }
    }

    /**
     * Select entrys from DB
     *
     * @param String $strSql
     * @param Boolean $blnReturnRes
     * @return Mixed Array or MySQL Resultset
     */
    public function RecordRead($strSql, $blnReturnRes = false) {
        if (!$resQueryResult = mysql_query($strSql, $this->resMysqlDB)) {
            throw new Exception('MySQL Query execute error: ' . mysql_error());
        }

        if ($blnReturnRes) {
            return $resQueryResult;
        }

        return mysql_fetch_array($resQueryResult, MYSQL_ASSOC);
    }

    /**
     * Select one entry from DB
     *
     * @param String $strSql
     * @return Array
     */
    public function ReadSingel($strSql) {
        if (!$resQueryResult = mysql_query($strSql, $this->resMysqlDB)) {
            throw new Exception('MySQL Query execute error: ' . mysql_error());
        }

        $arrReturn = mysql_fetch_array($resQueryResult, MYSQL_ASSOC);

        return array_shift($arrReturn);
    }

    /**
     * Do Insert into DB
     *
     * If you have two or more Rows to Insert, pass an Array like this:
     * 		array(
     * 			0 => array('uid', 'strName'),	//field lisst
     * 			1 => array(0, 'Name1'),			//row1
     * 			2 => array(1, 'Name2')			//row2
     * If you have only one row to insert, pass an Array like this:
     * 		array(
     * 			'uid'		=> 0,
     * 			'strName'	=> 'Name1'
     * 		)
     *
     * @param Array $arrFieldList
     * @param String $strTable
     * @return Boolean
     */
    public function doInsert($arrFieldList, $strTable) {
        if (empty($arrFieldList)) {
            throw new Exception("Fieldlist is empty!");
        }

        if ($strTable == '') {
            throw new Exception("Table is empty!");
        }

        $arrValues = array();
        $strSql = <<<SQL
INSERT INTO $strTable SET
    %s
SQL;
        if (!is_string(array_shift(array_keys($arrFieldList)))) {
            $arrFieldnames = array_shift($arrFieldList);
            $strSql = str_replace('SET', "\n    (" . implode(',', $arrFieldnames) . ")\nVALUES", $strSql);

            foreach ($arrFieldList as $arrRow) {
                $arrValues[] = "('" . implode("','", $arrRow) . "')";
            }
        } else {
            foreach ($arrFieldList as $strFieldName => $mixFieldValue) {
                $arrValues[] = "$strFieldName = '$mixFieldValue'";
            }
        }

        return $this->execute(sprintf($strSql, implode(",\n    ", $arrValues)));
    }

    /**
     * Update Row
     *
     * @param Array $arrFieldList
     * @param String $strTable
     * @param Array $arrConditions Optional
     * @return Boolean
     * @throws Exception
     */
    public function doUpdate($arrFieldList, $strTable, $arrConditions = array()) {
        if (empty($arrFieldList)) {
            throw new Exception("Fieldlist is empty!");
        }

        if ($strTable == '') {
            throw new Exception("Table is empty!");
        }

        $arrValues = array();
        $arrSelectors = array();
        $strSql = <<<SQL
UPDATE
    $strTable
SET
    %s
%s
SQL;
        foreach ($arrFieldList as $strFieldName => $mixFieldValue) {
            $arrValues[] = "$strFieldName = '$mixFieldValue'";
        }

        $blnFirst = true;
        if (!empty($arrConditions)) {
            foreach ($arrConditions as $strFieldName => $arrConditionParams) {
                if ($blnFirst) {
                    $arrSelectors[] = "WHERE\n    $strFieldName {$arrConditionParams['operator']} '{$arrConditionParams['value']}'";
                    $blnFirst = false;
                } else {
                    $arrSelectors[] = "\nAND\n    $strFieldName {$arrConditionParams['operator']} '{$arrConditionParams['value']}' ";
                }
            }
        }

        return $this->execute(sprintf($strSql, implode(",\n    ", $arrValues), implode('', $arrSelectors)));
    }

    /**
     * Execute SQL
     *
     * @param String $strSql
     * @return Boolean
     * @throws Exception
     */
    public function execute($strSql) {
        if (!Mysql_DB::blnDebug) {
            if (mysql_query($strSql, $this->resMysqlDB)) {
                return true;
            } else {
                throw new Exception('MySQL Query execute error: ' . mysql_error() . ' with SQL: ' . $strSql);
            }
        } else {
            echo "<br />Execute SQL:<br /><pre>" . $strSql . "</pre><br />";
        }
    }

}