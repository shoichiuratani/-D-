#!/usr/bin/env python3
"""
3D スーパーマーケットシミュレーション用HTTPサーバー
"""

import os
import sys
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import mimetypes

class SupermarketHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/home/user/webapp', **kwargs)
    
    def end_headers(self):
        # CORS ヘッダーを追加
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # MIME タイプの設定
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css; charset=utf-8')
        elif self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """カスタムログ出力"""
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

def run_server(port=8080):
    """HTTPサーバーを起動"""
    try:
        with socketserver.TCPServer(("0.0.0.0", port), SupermarketHTTPRequestHandler) as httpd:
            print(f"3D スーパーマーケットシミュレーションサーバー起動")
            print(f"ポート: {port}")
            print(f"URL: http://localhost:{port}")
            print("停止するには Ctrl+C を押してください")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを停止しています...")
    except Exception as e:
        print(f"サーバーエラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("無効なポート番号です。デフォルト8080を使用します。")
    
    run_server(port)