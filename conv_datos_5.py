import pandas as pd

# Cargar el CSV original
df = pd.read_csv("power_yucatan_25yrs.csv")

# Convertir la columna 'date' a datetime si quieres usarla antes de eliminar
df['date'] = pd.to_datetime(df['date'].astype(str), format="%Y%m%d")

# Clasificación climática
def clasificar_clima(row):
    if row['PRECTOTCORR'] > 5:
        return 3  # lluvioso
    elif row['WS10M'] > 3:
        return 2  # ventoso
    elif row['ALLSKY_SFC_SW_DWN'] > 20 and row['RH2M'] < 60:
        return 0  # soleado
    elif row['ALLSKY_SFC_SW_DWN'] < 15 and row['RH2M'] > 80:
        return 1  # nublado
    else:
        return 1  # por defecto, nublado

# Aplicar clasificación
df['CLIMA_TIPO'] = df.apply(clasificar_clima, axis=1)

# Eliminar columnas de fecha y coordenadas
df_clasificacion = df.drop(columns=['date', 'lat', 'lon'])

# Verificar resultado
print(df_clasificacion.head())
print(df_clasificacion['CLIMA_TIPO'].value_counts())

df_clasificacion.to_csv("dataset_RN5.csv", index=False)