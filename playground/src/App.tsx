import { Button, TextBox } from "#/index";

export function App() {
  return (
    <>
      <Button>ようこそ Win98 Playground へ！</Button>
      <div className="mt-4">
        <TextBox placeholder="ここにテキストを入力してください..." />
      </div>
    </>
  );
}
