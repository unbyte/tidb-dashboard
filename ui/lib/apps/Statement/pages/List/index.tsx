import React, { useState } from 'react'
import { Space, Tooltip, Drawer, Button, Checkbox, Result, Input } from 'antd'
import { useLocalStorageState } from '@umijs/hooks'
import {
  SettingOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane'
import { useTranslation } from 'react-i18next'

import { Card, ColumnsSelector, Toolbar, MultiSelect } from '@lib/components'

import { StatementsTable } from '../../components'
import StatementSettingForm from './StatementSettingForm'
import TimeRangeSelector from './TimeRangeSelector'
import useStatementTableController, {
  DEF_STMT_COLUMN_KEYS,
} from '../../utils/useStatementTableController'

const { Search } = Input

const STMT_VISIBLE_COLUMN_KEYS = 'statement.visible_column_keys'
const STMT_SHOW_FULL_SQL = 'statement.show_full_sql'

export default function StatementsOverview() {
  const { t } = useTranslation()

  const [showSettings, setShowSettings] = useState(false)
  const [visibleColumnKeys, setVisibleColumnKeys] = useLocalStorageState(
    STMT_VISIBLE_COLUMN_KEYS,
    DEF_STMT_COLUMN_KEYS
  )
  const [showFullSQL, setShowFullSQL] = useLocalStorageState(
    STMT_SHOW_FULL_SQL,
    false
  )

  const controller = useStatementTableController(visibleColumnKeys, showFullSQL)
  const {
    queryOptions,
    setQueryOptions,
    refresh,
    enable,
    allTimeRanges,
    allSchemas,
    allStmtTypes,
    loadingStatements,
    tableColumns,
  } = controller

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Card>
        <Toolbar>
          <Space>
            <TimeRangeSelector
              value={queryOptions.timeRange}
              timeRanges={allTimeRanges}
              onChange={(timeRange) =>
                setQueryOptions({
                  ...queryOptions,
                  timeRange,
                })
              }
            />
            <MultiSelect.Plain
              placeholder={t(
                'statement.pages.overview.toolbar.schemas.placeholder'
              )}
              selectedValueTransKey="statement.pages.overview.toolbar.schemas.selected"
              columnTitle={t(
                'statement.pages.overview.toolbar.schemas.columnTitle'
              )}
              value={queryOptions.schemas}
              style={{ width: 150 }}
              onChange={(schemas) =>
                setQueryOptions({
                  ...queryOptions,
                  schemas,
                })
              }
              items={allSchemas}
            />
            <MultiSelect.Plain
              placeholder={t(
                'statement.pages.overview.toolbar.statement_types.placeholder'
              )}
              selectedValueTransKey="statement.pages.overview.toolbar.statement_types.selected"
              columnTitle={t(
                'statement.pages.overview.toolbar.statement_types.columnTitle'
              )}
              value={queryOptions.stmtTypes}
              style={{ width: 150 }}
              onChange={(stmtTypes) =>
                setQueryOptions({
                  ...queryOptions,
                  stmtTypes,
                })
              }
              items={allStmtTypes}
            />
            <Search
              defaultValue={queryOptions.searchText}
              onSearch={(searchText) =>
                setQueryOptions({ ...queryOptions, searchText })
              }
            />
          </Space>

          <Space>
            {tableColumns.length > 0 && (
              <ColumnsSelector
                columns={tableColumns}
                visibleColumnKeys={visibleColumnKeys}
                defaultVisibleColumnKeys={DEF_STMT_COLUMN_KEYS}
                onChange={setVisibleColumnKeys}
                foot={
                  <Checkbox
                    checked={showFullSQL}
                    onChange={(e) => setShowFullSQL(e.target.checked)}
                  >
                    {t(
                      'statement.pages.overview.toolbar.select_columns.show_full_sql'
                    )}
                  </Checkbox>
                }
              />
            )}
            <Tooltip title={t('statement.settings.title')}>
              <SettingOutlined onClick={() => setShowSettings(true)} />
            </Tooltip>
            <Tooltip title={t('statement.pages.overview.toolbar.refresh')}>
              {loadingStatements ? (
                <LoadingOutlined />
              ) : (
                <ReloadOutlined onClick={refresh} />
              )}
            </Tooltip>
          </Space>
        </Toolbar>
      </Card>

      {enable ? (
        <div style={{ height: '100%', position: 'relative' }}>
          <ScrollablePane>
            <StatementsTable cardNoMarginTop controller={controller} />
          </ScrollablePane>
        </div>
      ) : (
        <Result
          title={t('statement.settings.disabled_result.title')}
          subTitle={t('statement.settings.disabled_result.sub_title')}
          extra={
            <Button type="primary" onClick={() => setShowSettings(true)}>
              {t('statement.settings.open_setting')}
            </Button>
          }
        />
      )}

      <Drawer
        title={t('statement.settings.title')}
        width={300}
        closable={true}
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        destroyOnClose={true}
      >
        <StatementSettingForm
          onClose={() => setShowSettings(false)}
          onConfigUpdated={refresh}
        />
      </Drawer>
    </div>
  )
}
