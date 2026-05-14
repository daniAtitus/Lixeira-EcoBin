import RPi.GPIO as GPIO
import time
import requests

# ==========================================
# CONFIGURAÇÕES DE HARDWARE
# ==========================================
PINO_TRIG = 23
PINO_ECHO = 24 # Lembrar do divisor de tensão!
PINO_LED  = 25 # Pino conectado ao LED frontal
    
ALTURA_LIXEIRA = 30.0  
DISTANCIA_MINIMA = 5.0 

# ==========================================
# CONFIGURAÇÕES DO SISTEMA E API
# ==========================================
URL_API = "10.1.25.15:8080/lixeiras/log"

# Dados fixos da lixeira (cadastrados previamente no backend)
ID_UNICO_LIXEIRA = "2" # Exemplo de UUID
NOME_LIXEIRA = "Lixeira Aterro"
CAPACIDADE_TOTAL_LITROS = 5.0

# Variáveis de Estado
tampa_aberta = False
tempo_abertura = 0
led_ligado = False

# ==========================================
# FUNÇÕES DE HARDWARE E CÁLCULO
# ==========================================
def configurar_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PINO_TRIG, GPIO.OUT)
    GPIO.setup(PINO_ECHO, GPIO.IN)
    GPIO.setup(PINO_LED, GPIO.OUT)
    
    GPIO.output(PINO_TRIG, False)
    GPIO.output(PINO_LED, False) # Inicia com o LED apagado
    time.sleep(2)

def medir_distancia():
    GPIO.output(PINO_TRIG, True)
    time.sleep(0.00001)
    GPIO.output(PINO_TRIG, False)

    pulse_start = time.time()
    pulse_end = time.time()
    timeout = pulse_start + 0.2 

    while GPIO.input(PINO_ECHO) == 0:
        pulse_start = time.time()
        if pulse_start > timeout:
            return -1

    while GPIO.input(PINO_ECHO) == 1:
        pulse_end = time.time()
        if pulse_end > timeout:
            return -1

    duracao = pulse_end - pulse_start
    distancia = (duracao * 34300) / 2 
    return distancia

def calcular_porcentagem(distancia):
    if distancia < DISTANCIA_MINIMA:
        return 100.0
    elif distancia > ALTURA_LIXEIRA:
        return 0.0
    
    espaco_total = ALTURA_LIXEIRA - DISTANCIA_MINIMA
    espaco_preenchido = ALTURA_LIXEIRA - distancia
    porcentagem = (espaco_preenchido / espaco_total) * 100
    
    return round(porcentagem, 1)

# ==========================================
# INTEGRAÇÃO COM A API
# ==========================================
def enviar_dados(porcentagem, estado_tampa, tempo_aberta_segundos=0):
    dados = {
        "id_lixeira": ID_UNICO_LIXEIRA,
        "nome": NOME_LIXEIRA,
        "porcentagem_cheia": porcentagem,
        "tampa_aberta": estado_tampa,
        "tempo_aberta_segundos": tempo_aberta_segundos
    }
    try:
        resposta = requests.post(URL_API, json=dados, timeout=5)
        print(f"[HTTP] Dados enviados! Status Code: {resposta.status_code}")
    except Exception as erro:
        print(f"[HTTP] Erro de conexão com o site: {erro}")

# ==========================================
# LOOP PRINCIPAL
# ==========================================
def iniciar_sistema():
    global tampa_aberta, tempo_abertura, led_ligado
    
    try:
        configurar_gpio()
        print("Sistema iniciado. Monitorando lixeira...")
        
        while True:
            distancia = medir_distancia()
            tempo_atual = time.time()
            
            # Condição 1: Leitura maior que a altura ou inválida -> Tampa está aberta
            if distancia == -1 or distancia > (ALTURA_LIXEIRA + 5): 
                if not tampa_aberta:
                    print("Status: Tampa Aberta!")
                    tampa_aberta = True
                    tempo_abertura = tempo_atual
                    enviar_dados(0, True, 0)
                
                # Se a tampa já está aberta, verifica se passou de 60 segundos
                if tampa_aberta and not led_ligado:
                    if (tempo_atual - tempo_abertura) >= 60.0:
                        print("Alerta: Tampa aberta há mais de 1 minuto! Ligando LED.")
                        GPIO.output(PINO_LED, True)
                        led_ligado = True
                        
            # Condição 2: Leitura dentro dos limites -> Tampa está fechada
            else:
                if tampa_aberta:
                    tempo_total_aberta = round(tempo_atual - tempo_abertura, 2)
                    print(f"Status: Tampa Fechou. Tempo aberta: {tempo_total_aberta}s")
                    
                    tampa_aberta = False
                    
                    # Desliga o LED assim que identificar o fechamento
                    if led_ligado:
                        GPIO.output(PINO_LED, False)
                        led_ligado = False
                        print("Tampa fechada, LED de alerta desligado.")
                    
                    # Envia atualização para a API
                    porcentagem = calcular_porcentagem(distancia)
                    enviar_dados(porcentagem, False, tempo_total_aberta)
            
            time.sleep(1) 
            
    except KeyboardInterrupt:
        print("\nPrograma encerrado.")
    finally:
        GPIO.cleanup()

if __name__ == '__main__':
    iniciar_sistema()