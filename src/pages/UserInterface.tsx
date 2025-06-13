import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface KeyRecord {
  id: string;
  name: string;
  barcode: string;
  takenBy?: string;
  takenAt?: Date;
  available: boolean;
}

const UserInterface = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("");
  const [keys, setKeys] = useState<KeyRecord[]>([]);

  // Загрузка ключей из localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem("keys");
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys).map((key: any) => ({
        ...key,
        takenAt: key.takenAt ? new Date(key.takenAt) : undefined,
      }));
      setKeys(parsedKeys);
    }
  }, []);

  // Сохранение ключей в localStorage при изменении статуса
  const updateKeyStatus = (
    keyId: string,
    available: boolean,
    takenBy?: string,
  ) => {
    const updatedKeys = keys.map((key) =>
      key.id === keyId
        ? {
            ...key,
            available,
            takenBy: available ? undefined : takenBy,
            takenAt: available ? undefined : new Date(),
          }
        : key,
    );
    setKeys(updatedKeys);
    localStorage.setItem("keys", JSON.stringify(updatedKeys));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = keys.find((k) => k.barcode === barcode);

    if (key) {
      if (key.available) {
        // Взятие ключа
        updateKeyStatus(key.id, false, "Текущий пользователь");
        toast.success(`Ключ "${key.name}" выдан`);
      } else {
        // Возврат ключа
        updateKeyStatus(key.id, true);
        toast.success(`Ключ "${key.name}" возвращен`);
      }
    } else {
      toast.error("Ключ с таким штрих-кодом не найден");
        setBarcode("");
        return;
      }

      setKeys(updatedKeys);
      localStorage.setItem("keys", JSON.stringify(updatedKeys));
    } else {
      toast.error("Ключ с таким штрих-кодом не найден");
    }

    setBarcode("");
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Icon name="Scan" className="text-purple-600" size={24} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Выдача ключей
                </h1>
                {currentUser && (
                  <p className="text-sm text-gray-600">
                    Пользователь: {currentUser}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Сканер штрих-кода */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="ScanLine" className="text-purple-600" />
              <span>Сканирование штрих-кода</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="barcode" className="sr-only">
                  Штрих-код
                </Label>
                <Input
                  id="barcode"
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Отсканируйте или введите штрих-код"
                  className="text-lg"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Icon name="Search" size={16} className="mr-2" />
                Найти ключ
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Список ключей */}
        <Card>
          <CardHeader>
            <CardTitle>Статус ключей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${key.available ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <div>
                      <h3 className="font-medium">{key.name}</h3>
                      <p className="text-sm text-gray-500">
                        Штрих-код: {key.barcode}
                      </p>
                      {!key.available && key.takenBy && (
                        <p className="text-sm text-orange-600">
                          Взят: {key.takenBy} ({key.takenAt?.toLocaleString()})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        key.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {key.available ? "Доступен" : "Выдан"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Демо коды */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">
              Демо штрих-коды для тестирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-2 bg-gray-100 rounded text-center">
                123456789
              </div>
              <div className="p-2 bg-gray-100 rounded text-center">
                987654321
              </div>
              <div className="p-2 bg-gray-100 rounded text-center">
                456789123
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserInterface;
