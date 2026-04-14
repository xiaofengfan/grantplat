# -*- coding: utf-8 -*-
import sys
import os

word_path = r'e:\DEVWORKSPACE\gant\grantplat\prd\新一代股票量化交易平台功能详细设计 - 副本.docx'
output_path = r'e:\DEVWORKSPACE\gant\grantplat\prd_content.txt'

ps_script = f'''
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("{word_path.replace('\\', '\\\\')}")
$doc.Content.Text | Out-File -FilePath "{output_path.replace('\\', '\\\\')}" -Encoding UTF8
$doc.Close()
$word.Quit()
'''

with open(r'e:\DEVWORKSPACE\gant\grantplat\read_word.ps1', 'w', encoding='utf-8') as f:
    f.write(ps_script)

print("PowerShell script created")
