import pandas as pd

def carregar_dados_csv(caminho_arquivo):
    """Lê o CSV exportado e prepara os tipos de dados"""
    # Lê o arquivo usando o ponto e vírgula como separador
    df = pd.read_csv(caminho_arquivo, sep=';')
    
    # Converte a coluna data_hora para datetime, ignorando erros se houver linhas em branco
    df['data_hora'] = pd.to_datetime(df['data_hora'], errors='coerce')
    
    # LIMPEZA DE DADOS: Padronizando o identificador_unico
    # Converte tudo para texto
    df['identificador_unico'] = df['identificador_unico'].astype(str)
    # Remove o '.0' do final caso o Pandas tenha transformado '1' em '1.0'
    df['identificador_unico'] = df['identificador_unico'].apply(lambda x: x[:-2] if x.endswith('.0') else x)
    
    # Padroniza a coluna status_tampa para evitar problemas com espaços ou letras maiúsculas
    df['status_tampa'] = df['status_tampa'].astype(str).str.strip().str.lower()
    
    # Remove linhas onde a data não pôde ser lida (linhas corrompidas)
    df = df.dropna(subset=['data_hora'])
    
    return df

def lixeiras_cheias_no_dia(df, data_alvo):
    """Quais lixeiras ficaram cheias (>= 90%) em um determinado dia"""
    df_dia = df[df['data_hora'].dt.date.astype(str) == data_alvo]
    
    # Filtra lixeiras com ocupação >= 90
    cheias = df_dia[df_dia['nivel_atual_ocupacao'] >= 90.0]
    
    return cheias['nome'].unique().tolist()

def quantidade_aberturas_no_dia(df, data_alvo, id_lixeira):
    """Quantas vezes uma lixeira específica foi aberta num dia"""
    # Filtra os dados apenas para o dia desejado
    df_dia = df[df['data_hora'].dt.date.astype(str) == data_alvo]
    
    # Converte o id buscado para string para garantir que bata com a nossa base limpa
    id_busca = str(id_lixeira)
    
    # Filtra pela lixeira específica e conta apenas os registros onde a tampa abriu
    aberturas = df_dia[(df_dia['identificador_unico'] == id_busca) & (df_dia['status_tampa'] == 'aberta')]
    
    return len(aberturas)

def lixeiras_abertas_no_momento(df, data_hora_exata):
    """Quais lixeiras estavam com a tampa aberta num momento específico"""
    df_ate_momento = df[df['data_hora'] <= data_hora_exata]
    
    if df_ate_momento.empty:
        return []

    # Ordena pelo tempo e pega o último status gravado de cada lixeira antes do momento alvo
    ultimo_status = df_ate_momento.sort_values('data_hora').groupby('identificador_unico').last()
    
    # Filtra as que o status parou em 'aberta'
    lixeiras_abertas = ultimo_status[ultimo_status['status_tampa'] == 'aberta']
    
    return lixeiras_abertas['nome'].tolist()

# ==========================================
# EXECUTANDO A ANÁLISE COM OS DADOS DO SEU CSV
# ==========================================
if __name__ == "__main__":
    try:
        dados = carregar_dados_csv('historico_lixeiras.csv')
        
        print("--- RELATÓRIO ECOBIN ---\n")
        
        # 1. Quais lixeiras ficaram cheias no dia 14/05/2026?
        data_pesquisa = '2026-05-14' 
        cheias = lixeiras_cheias_no_dia(dados, data_pesquisa)
        print(f"Lixeiras cheias no dia {data_pesquisa}:")
        print(f" -> {cheias if cheias else 'Nenhuma lixeira cheia.'}\n")
        
        # 2. Quantas vezes a 'Lixeira Aterro' (ID 2) foi aberta no dia 14/05/2026?
        id_pesquisa = '2'
        vezes_aberta = quantidade_aberturas_no_dia(dados, data_pesquisa, id_pesquisa)
        print(f"A Lixeira ID '{id_pesquisa}' foi aberta {vezes_aberta} vezes no dia {data_pesquisa}.\n")

        # Extra: Quantas vezes a 'Lixeira Praça Central' (ID 1) foi aberta no dia 14/05/2026?
        id_pesquisa_praca = '1'
        vezes_aberta_praca = quantidade_aberturas_no_dia(dados, data_pesquisa, id_pesquisa_praca)
        print(f"A Lixeira ID '{id_pesquisa_praca}' foi aberta {vezes_aberta_praca} vezes no dia {data_pesquisa}.\n")
        
        # 3. Status no momento exato (Vamos verificar no meio dos testes da Praça Central)
        momento_pesquisa = '2026-05-14 00:39:20'
        abertas_agora = lixeiras_abertas_no_momento(dados, momento_pesquisa)
        print(f"Lixeiras com a tampa aberta exatamente em {momento_pesquisa}:")
        print(f" -> {abertas_agora if abertas_agora else 'Todas as lixeiras estavam fechadas.'}\n")

    except FileNotFoundError:
        print("Arquivo 'historico_lixeiras.csv' não encontrado.")
    except Exception as e:
        print(f"Ocorreu um erro na análise: {e}")