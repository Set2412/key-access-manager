import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BarcodeScanner from "@/components/BarcodeScanner";

interface KeyRecord {
  id: string;
  name: string;
  barcode: string;
  takenBy?: string;
  takenAt?: Date;
  available: boolean;
}

interface KeyHistoryRecord {
  id: string;
  keyName: string;
  keyBarcode: string;
  action: "taken" | "returned";
  timestamp: Date;
  userName: string;
}

const UserInterface = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [returnBarcode, setReturnBarcode] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("");
  const [fullUserName, setFullUserName] = useState<string>("");
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keyHistory, setKeyHistory] = useState<KeyHistoryRecord[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<"issue" | "return">("issue");

  // Загрузка пользователя из localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.username === savedUser);
      if (user) {
        setFullUserName(user.fullName || user.name || savedUser);
      }
    }
  }, []);

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

  // Загрузка истории ключей
  useEffect(() => {
    const savedHistory = localStorage.getItem("keyHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp),
      }));
      setKeyHistory(
        parsedHistory.filter(
          (record: KeyHistoryRecord) => record.userName === currentUser,
        ),
      );
    }
  }, [currentUser]);

  // Добавление записи в историю
  const addToHistory = (key: KeyRecord, action: "taken" | "returned") => {
    const historyRecord: KeyHistoryRecord = {
      id: Date.now().toString(),
      keyName: key.name,
      keyBarcode: key.barcode,
      action,
      timestamp: new Date(),
      userName: fullUserName || currentUser,
    };

    const allHistory = JSON.parse(localStorage.getItem("keyHistory") || "[]");
    allHistory.push(historyRecord);
    localStorage.setItem("keyHistory", JSON.stringify(allHistory));

    setKeyHistory((prev) => [...prev, historyRecord]);
  };

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
    processBarcodeAction(barcode, "issue");
    setBarcode("");
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcodeAction(returnBarcode, "return");
    setReturnBarcode("");
  };

  const processBarcodeAction = (code: string, mode: "issue" | "return") => {
    const key = keys.find((k) => k.barcode === code);

    if (key) {
      if (mode === "issue") {
        if (key.available) {
          updateKeyStatus(key.id, false, fullUserName || currentUser);
          addToHistory(key, "taken");
          toast({ title: "Успех", description: `Ключ "${key.name}" выдан` });
        } else {
          toast({
            title: "Ошибка",
            description: "Ключ уже выдан",
            variant: "destructive",
          });
        }
      } else {
        if (!key.available) {
          updateKeyStatus(key.id, true);
          addToHistory(key, "returned");
          toast({
            title: "Успех",
            description: `Ключ "${key.name}" возвращен`,
          });
        } else {
          toast({
            title: "Ошибка",
            description: "Ключ уже доступен",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "Ошибка",
        description: "Ключ с таким штрих-кодом не найден",
        variant: "destructive",
      });
    }
  };

  const handleScanResult = (result: string) => {
    processBarcodeAction(result, scannerMode);
    setShowScanner(false);
  };

  const openScanner = (mode: "issue" | "return") => {
    setScannerMode(mode);
    setShowScanner(true);
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
                  Управление ключами
                </h1>
                {fullUserName && (
                  <p className="text-sm text-gray-600">
                    Пользователь: {fullUserName}
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
        <Tabs defaultValue="issue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issue">Выдача ключей</TabsTrigger>
            <TabsTrigger value="return">Возврат ключей</TabsTrigger>
            <TabsTrigger value="history">История ключей</TabsTrigger>
          </TabsList>

          <TabsContent value="issue">
            {/* Сканер штрих-кода для выдачи */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="ScanLine" className="text-purple-600" />
                  <span>Выдача ключа</span>
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
                    type="button"
                    variant="outline"
                    onClick={() => openScanner("issue")}
                    className="px-3"
                  >
                    <Icon name="Camera" size={20} />
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Icon name="Search" size={16} className="mr-2" />
                    Взять ключ
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="return">
            {/* Сканер штрих-кода для возврата */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="RotateCcw" className="text-green-600" />
                  <span>Возврат ключа</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReturnSubmit} className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="returnBarcode" className="sr-only">
                      Штрих-код для возврата
                    </Label>
                    <Input
                      id="returnBarcode"
                      type="text"
                      value={returnBarcode}
                      onChange={(e) => setReturnBarcode(e.target.value)}
                      placeholder="Отсканируйте штрих-код ключа для возврата"
                      className="text-lg"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openScanner("return")}
                    className="px-3"
                  >
                    <Icon name="Camera" size={20} />
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Вернуть ключ
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="History" className="text-blue-600" />
                  <span>История ключей</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {keyHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      История операций пуста
                    </p>
                  ) : (
                    keyHistory
                      .sort(
                        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
                      )
                      .map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                record.action === "taken"
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                            />
                            <div>
                              <h3 className="font-medium">{record.keyName}</h3>
                              <p className="text-sm text-gray-500">
                                Штрих-код: {record.keyBarcode}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                record.action === "taken"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {record.action === "taken" ? "Взят" : "Возвращен"}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              {record.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
                            Взят: {key.takenBy} ({key.takenAt?.toLocaleString()}
                            )
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
        </Tabs>

        {/* Сканер штрих-кодов */}
        {showScanner && (
          <BarcodeScanner
            onResult={handleScanResult}
            onError={(error) => {
              console.error("Ошибка сканирования:", error);
              toast({
                title: "Ошибка",
                description: "Не удалось отсканировать код",
                variant: "destructive",
              });
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </main>
    </div>
  );
};

export default UserInterface;
