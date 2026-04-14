# -*- coding: utf-8 -*-
import zipfile
import xml.etree.ElementTree as ET
import re
import os

docx_path = r'e:\DEVWORKSPACE\gant\grantplat\prd\新一代股票量化交易平台功能详细设计 - 副本.docx'
output_path = r'e:\DEVWORKSPACE\gant\grantplat\prd_content.txt'

def extract_text_from_docx(docx_path, output_path):
    with zipfile.ZipFile(docx_path, 'r') as z:
        with z.open('word/document.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()

    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

    paragraphs = []
    for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = []
        for text in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if text.text:
                texts.append(text.text)
        line = ''.join(texts)
        if line.strip():
            paragraphs.append(line)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(paragraphs))

    print(f"Content extracted to {output_path}")
    print(f"Total paragraphs: {len(paragraphs)}")

extract_text_from_docx(docx_path, output_path)
