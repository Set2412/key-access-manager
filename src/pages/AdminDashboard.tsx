import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import KeyManager from "@/components/KeyManager";
import UserManager from "@/components/UserManager";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalKeys: 0,
    availableKeys: 0,
    totalUsers: 0,
    activeKeys: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      // Получаем данные из localStorage
      const keys = JSON.parse(localStorage.getItem("keys") || "[]");
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Подсчитываем статистику
      const totalKeys = keys.length;
      const availableKeys = keys.filter(
        (key: any) => key.status === "available",
      ).length;
      const activeKeys = keys.filter(
        (key: any) => key.status === "taken",
      ).length;
      const totalUsers = users.length;

      setStats({
        totalKeys,
        availableKeys,
        totalUsers,
        activeKeys,
      });
    };

    calculateStats();

    // Обновляем статистику при изменении данных
    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" className="text-purple-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900">
                Панель администратора
              </h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего ключей
              </CardTitle>
              <Icon name="Key" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доступные</CardTitle>
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.availableKeys}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Пользователи
              </CardTitle>
              <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <Icon name="UserCheck" className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.activeKeys}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основной интерфейс */}
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys" className="flex items-center space-x-2">
              <Icon name="Key" size={16} />
              <span>Управление ключами</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Icon name="Users" size={16} />
              <span>Управление пользователями</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <KeyManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
