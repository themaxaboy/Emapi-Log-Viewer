# -*- coding: utf-8 -*-
from collections import OrderedDict
from pprint import pprint
import json

f = open('messages-simple.txt', 'r')
lines = f.readlines()
f.close()
codes = {}
msg = OrderedDict()
field_mapper = {}
n = len(lines)
i = 0
while i < n:
    l = lines[i]
    if l.startswith('Message:'):        
        msg = OrderedDict()
        msg['title'] = l.split(':', 1)[1].strip()
    elif l.startswith('Message ID:'):
        m_id = l.split(':', 1)[1].strip()
        msg['id'] = int(m_id)
        codes[m_id] = msg
    elif l.startswith('Type:'):
        msg['type'] = l.split(':', 1)[1].strip()
    elif l.startswith('Description:'):
        msg['desc'] = l.split(':', 1)[1].strip()
    chucks = l.split('\t', 4)
    if len(chucks) == 5 and chucks[0].isdigit():
        d = None
        while (len(chucks) == 5 and chucks[0].isdigit()) or (len(chucks) == 1 and not chucks[0].startswith('Message:')):
            if not 'fields' in msg:
                msg['fields'] = {}
            if len(chucks) == 1:
                if len(l.strip()) > 0:
                    d['comment'] += " " + l.strip()
            else:
                d = OrderedDict()
                msg['fields'][chucks[0]] = d
                d['no'] = int(chucks[0])
                d['name'] = chucks[1]
                if not d['name'] in field_mapper:
                    field_mapper[d['name']] = [ ]
                field_mapper[d['name']].append(msg['id'])
                d['required'] = chucks[2] == 'required'
                d['type'] = chucks[3]
                d['comment'] = chucks[4].strip()
            i += 1
            if i >= n:
                break
            l = lines[i]
            chucks = l.split('\t', 4)
    else:
        i += 1

final_codes = OrderedDict()
for key in sorted(codes.keys(), key=int):
    # if key == "2":
    #     pprint(codes[key])
    final_codes[key] = codes[key]
    if not 'fields' in codes[key]:
        final_codes[key]['fields'] = {}
    else:
        final_codes[key]['fields'] = OrderedDict(sorted(codes[key]['fields'].items(), key=lambda t: int(t[0])))

print '\nFinish!!, there are {0:,} message{1} in total.'.format(len(final_codes), "s" if len(final_codes) > 1 else "")
message_export_name = 'emapi_codes.txt'
json.dump(final_codes, open(message_export_name, 'w'), indent=4) 
print 'Exported messages as JSON format to', message_export_name

for key in field_mapper:
    field_mapper[key] = [str(val) for val in sorted(field_mapper[key])]
field_export_name = 'emapi_field_mapper.txt'
json.dump(field_mapper, open(field_export_name, 'w'), indent=4, sort_keys=True)
print 'Exported field mapper as JSON format to', field_export_name