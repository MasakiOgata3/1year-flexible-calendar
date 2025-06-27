import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Building2, Calendar, Settings, Download, HelpCircle } from 'lucide-react';
import { cn } from '@/utils';

function App() {
  const [activeTab, setActiveTab] = useState<'basic' | 'holidays' | 'advanced'>('basic');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              1年単位変形労働時間制カレンダー作成ツール
            </h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              出力
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              ヘルプ
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>設定</CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Tab Navigation */}
                <div className="space-y-1 mb-6">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === 'basic'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    基本設定
                  </button>
                  <button
                    onClick={() => setActiveTab('holidays')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === 'holidays'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    休日設定
                  </button>
                  <button
                    onClick={() => setActiveTab('advanced')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === 'advanced'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    詳細設定
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          起算日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="input"
                          defaultValue="2024-04-01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          1日の所定労働時間 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="input"
                            defaultValue="8"
                            min="0"
                            max="12"
                            step="0.5"
                          />
                          <span className="text-sm text-gray-500">時間</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          週の開始曜日
                        </label>
                        <select className="input">
                          <option value="sunday">日曜日</option>
                          <option value="monday">月曜日</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'holidays' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        休日パターンの設定（開発中）
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'advanced' && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        詳細設定（開発中）
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    2024年度カレンダー
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm">要件チェック</Button>
                    <Button size="sm" variant="secondary">カレンダー生成</Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">カレンダーを生成してください</p>
                    <p className="text-sm">左側で設定を入力し、「カレンダー生成」ボタンをクリックしてください</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            1年単位変形労働時間制カレンダー作成ツール v1.0
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">設定保存</Button>
            <Button size="sm">カレンダー生成</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;