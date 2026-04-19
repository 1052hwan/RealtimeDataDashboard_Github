import os

file_path = r'c:\Users\1052h\RealtimeDataDashboard\dist_04191855\assets\index-dpdkk85d.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 차트 데이터 시간 처리 로직 수정
old_chart = 'time:yN(t.getTime()>new Date().getTime()+36e5?SN(t,9):t,`MM/dd HH:mm`)'
new_chart = 'time:yN(new Date(e.observed_at.replace("+00","")),`MM/dd HH:mm`)'
content = content.replace(old_chart, new_chart)

# 2. 최근 관측 시간 텍스트 로직 수정
old_latest = 'yN(new Date(s.observed_at).getTime()>new Date().getTime()+36e5?SN(new Date(s.observed_at),9):new Date(s.observed_at),`yyyy-MM-dd HH:mm`)'
new_latest = 'yN(new Date(s.observed_at.replace("+00","")),`yyyy-MM-dd HH:mm`)'
content = content.replace(old_latest, new_latest)

# 3. 쿼리 필터 시간 형식 수정 (LTE/GTE)
old_query = '.gte(`observed_at`,xN(i)).lte(`observed_at`,xN(n))'
new_query = '.gte(`observed_at`,yN(i,`yyyy-MM-dd"T"HH:mm:ss`)+`+00`).lte(`observed_at`,yN(n,`yyyy-MM-dd"T"HH:mm:ss`)+`+00`)'
content = content.replace(old_query, new_query)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
