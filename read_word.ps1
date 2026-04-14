
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("e:\\DEVWORKSPACE\\gant\\grantplat\\prd\\新一代股票量化交易平台功能详细设计 - 副本.docx")
$doc.Content.Text | Out-File -FilePath "e:\\DEVWORKSPACE\\gant\\grantplat\\prd_content.txt" -Encoding UTF8
$doc.Close()
$word.Quit()
