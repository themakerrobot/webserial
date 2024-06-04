import serial
import time
from threading import Timer
import subprocess
import sys

# 시리얼 포트 설정
ser = serial.Serial(
    port='/dev/ttyS0',
    baudrate=115200,
    timeout=1
)

filename = 'aaa.py'

def run_code(filename):
    # filename (python코드) 실행하면서 나오는 로그를 시리얼 포트로 보냄
    try:
        process = subprocess.Popen(['python', filename], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

        for line in iter(process.stdout.readline, ''):
            if line:
                print(line, end='')  # 화면에 출력
                ser.write(line.encode('utf-8'))  # 시리얼 포트로 전송

        process.stdout.close()
        process.wait()
    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message)
        ser.write(error_message.encode('utf-8'))

while True:
    lines = ser.readlines()
    print(lines)

    if len(lines) > 0:
        with open(filename, 'w') as file:
            for line in lines:
                decoded_line = line.decode('utf-8')
                file.write(decoded_line)
        print('file save ok')
        
        timer = Timer(1, run_code, args=(filename,)) 
        timer.daemon = True
        timer.start()
