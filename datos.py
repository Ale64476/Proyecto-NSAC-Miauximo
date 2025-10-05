#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import pandas as pd
import netrc
import os
from requests.auth import HTTPBasicAuth

# ================= CONFIGURACIÓN =================
start_year, end_year = 1998, 2022
lat_min, lat_max = 18.0, 21.0
lon_min, lon_max = -90.0, -87.0
step = 0.5

variables_expected = [
    "PRECTOTCORR",
    "T2M_MAX",
    "T2M_MIN",
    "RH2M",
    "WS10M",
    "ALLSKY_SFC_SW_DWN"
]

output_file = "power_yucatan_25yrs.csv"

# ================= AUTENTICACIÓN =================
netrc_path = os.path.expanduser("~/_netrc" if os.name == "nt" else "~/.netrc")
usuario, _, contraseña = netrc.netrc(netrc_path).authenticators("urs.earthdata.nasa.gov")

# ================= FUNCIONES AUXILIARES =================
def find_equivalent(var_name, present_vars):
    u = var_name.upper()
    if "PREC" in u or "RAIN" in u:
        candidates = [p for p in present_vars if ("PREC" in p.upper() or "RAIN" in p.upper())]
    else:
        candidates = [p for p in present_vars if u in p.upper()]
    return candidates[0] if candidates else None

# ================= DESCARGA DE DATOS =================
data_list = []
latitudes = [lat_min + i*step for i in range(int((lat_max-lat_min)/step)+1)]
longitudes = [lon_min + i*step for i in range(int((lon_max-lon_min)/step)+1)]

for lat in latitudes:
    for lon in longitudes:
        print(f"Descargando datos para lat={lat}, lon={lon}...")
        url = (
            "https://power.larc.nasa.gov/api/temporal/daily/point"
            f"?parameters={','.join(variables_expected)}"
            f"&community=AG"
            f"&longitude={lon}&latitude={lat}"
            f"&start={start_year}0101&end={end_year}1231"
            "&format=JSON"
        )
        r = requests.get(url, auth=HTTPBasicAuth(usuario, contraseña))
        if r.status_code != 200:
            print(f"⚠️ Error {r.status_code} en lat={lat}, lon={lon}")
            continue

        datos = r.json().get("properties", {}).get("parameter", {})
        if not datos:
            continue

        present_vars = set(datos.keys())
        var_map = {v: (v if v in present_vars else find_equivalent(v, present_vars)) for v in variables_expected}
        date = list(datos[next(iter(present_vars))].keys())

        for date in date:
            row = {"date": date, "lat": lat, "lon": lon}
            for var in variables_expected:
                actual = var_map.get(var)
                row[var] = datos.get(actual, {}).get(date) if actual else None
            data_list.append(row)

# ================= GUARDADO =================
df = pd.DataFrame(data_list)
df.to_csv(output_file, index=False)
print(f"\n✅ Archivo guardado: {output_file}")
print(f"Registros totales: {len(df)}")
