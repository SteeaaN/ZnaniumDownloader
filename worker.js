const DECRYPT_SVG_WASM_BASE64 = "AGFzbQEAAAABNAlgA39/fwF/YAF/AX9gAX8AYAN/f38AYAJ/fwF/YAAAYAR/f39/AX9gBX9/f39/AGAAAX8DEhEFBAIDAQYDAQMHAAQBAgECCAQFAXABAwMFBgEBggKCAgYIAX8BQdCSBAsHmQEJBm1lbW9yeQIACmRlY3J5cHRTVkcAAQZtYWxsb2MADApmcmVlTWVtb3J5AAIEZnJlZQANGV9faW5kaXJlY3RfZnVuY3Rpb25fdGFibGUBAAtfaW5pdGlhbGl6ZQAAGV9lbXNjcmlwdGVuX3N0YWNrX3Jlc3RvcmUADxxlbXNjcmlwdGVuX3N0YWNrX2dldF9jdXJyZW50ABAJCAEAQQELAgAKDAEQCulgERMAQbAOQbgNNgIAQegNQSo2AgALtwYBDX8jAEGQAmsiBSQAIAEtAAAiAwRAA0AgBSADwDYCACMAQRBrIgskACALIAU2AgxBACEIIwBBoAFrIgQkACAEQQhqIgJBgAxBkAH8CgAAIAQgBUEQaiAKaiIJNgI0IAQgCTYCHCAEQf////8HQX4gCWsiAyADQf////8HSxsiAzYCOCAEIAMgCWoiAzYCJCAEIAM2AhgjAEHQAWsiAyQAIAMgBTYCzAEgA0GgAWoiBkEAQSj8CwAgAyADKALMATYCyAECQEEAIANByAFqIANB0ABqIAYQBUEASARAQX8hAgwBCyACKAJMQQBIIQ0gAiACKAIAIg5BX3E2AgACfwJAAkAgAigCMEUEQCACQdAANgIwIAJBADYCHCACQgA3AxAgAigCLCEIIAIgAzYCLAwBCyACKAIQDQELQX8gAhAEDQEaCyACIANByAFqIANB0ABqIANBoAFqEAULIQYgCARAIAJBAEEAIAIoAiQRAAAaIAJBADYCMCACIAg2AiwgAkEANgIcIAIoAhQhCCACQgA3AxAgBkF/IAgbIQYLIAIgAigCACICIA5BIHFyNgIAQX8gBiACQSBxGyECIA0NAAsgA0HQAWokACAJQX5HBEAgBCgCHCIDIAMgBCgCGEZrQQA6AAALIARBoAFqJAAgC0EQaiQAIAIgCmohCiABIAdBAWoiB2otAAAiAw0ACwsCfwJAAkAgACICQQNxRQ0AQQAgAi0AAEUNAhoDQCAAQQFqIgBBA3FFDQEgAC0AAA0ACwwBCwNAIAAiAUEEaiEAQYCChAggASgCACIDayADckGAgYKEeHFBgIGChHhGDQALA0AgASIAQQFqIQEgAC0AAA0ACwsgACACawtBAWoQDCIABEBBACEHIAItAAAiAwRAQQAhAQNAAn8CQCADQTBrIgRB/wFxQQlLDQAgAUUNACAEQTByQf8BcSAFQRBqIAxqLAAAayIBQQpqIAEgAUEASBtBgAhqLQAAIQMgDEEBaiAKbyEMQQEMAQtBASABIANBPkYbCyEBIAAgB2ogAzoAACACIAdBAWoiB2otAAAiAw0ACwsgACAHakEAOgAACyAFQZACaiQAIAALBgAgABANC4UEAQJ/IAJBgARPBEAgAgRAIAAgASAC/AoAAAsPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAEEDcUUEQCAAIQIMAQsgAkUEQCAAIQIMAQsgACECA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgJBA3FFDQEgAiADSQ0ACwsgA0F8cSEAAkAgA0HAAEkNACACIABBQGoiBEsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQUBrIQEgAkFAayICIARNDQALCyAAIAJNDQEDQCACIAEoAgA2AgAgAUEEaiEBIAJBBGoiAiAASQ0ACwwBCyADQQRJBEAgACECDAELIANBBGsiBCAASQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAiABLQABOgABIAIgAS0AAjoAAiACIAEtAAM6AAMgAUEEaiEBIAJBBGoiAiAETQ0ACwsgAiADSQRAA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLC1kBAX8gACAAKAJIIgFBAWsgAXI2AkggACgCACIBQQhxBEAgACABQSByNgIAQX8PCyAAQgA3AgQgACAAKAIsIgE2AhwgACABNgIUIAAgASAAKAIwajYCEEEAC54VAhN/A35BlAghBSMAQUBqIgYkACAGQZQINgI8IAZBJ2ohFSAGQShqIQ8CQAJAAkACQANAQQAhBANAIAUhCSAEIAxB/////wdzSg0CIAQgDGohDAJAAkACQAJAIAUiBC0AACIKBEADQAJAAkAgCkH/AXEiBUUEQCAEIQUMAQsgBUElRw0BIAQhCgNAIAotAAFBJUcEQCAKIQUMAgsgBEEBaiEEIAotAAIhByAKQQJqIgUhCiAHQSVGDQALCyAEIAlrIgQgDEH/////B3MiFkoNCSAABEAgACAJIAQQBgsgBA0HIAYgBTYCPCAFQQFqIQRBfyEOAkAgBSwAAUEwayIHQQlLDQAgBS0AAkEkRw0AIAVBA2ohBEEBIRAgByEOCyAGIAQ2AjxBACELAkAgBCwAACIKQSBrIgVBH0sEQCAEIQcMAQsgBCEHQQEgBXQiBUGJ0QRxRQ0AA0AgBiAEQQFqIgc2AjwgBSALciELIAQsAAEiCkEgayIFQSBPDQEgByEEQQEgBXQiBUGJ0QRxDQALCwJAIApBKkYEQAJ/AkAgBywAAUEwayIEQQlLDQAgBy0AAkEkRw0AAn8gAEUEQCADIARBAnRqQQo2AgBBAAwBCyACIARBA3RqKAIACyENIAdBA2ohBUEBDAELIBANBiAHQQFqIQUgAEUEQCAGIAU2AjxBACEQQQAhDQwDCyABIAEoAgAiBEEEajYCACAEKAIAIQ1BAAshECAGIAU2AjwgDUEATg0BQQAgDWshDSALQYDAAHIhCwwBCyAGQTxqEAciDUEASA0KIAYoAjwhBQtBACEEQX8hCAJ/QQAgBS0AAEEuRw0AGiAFLQABQSpGBEACfwJAIAUsAAJBMGsiB0EJSw0AIAUtAANBJEcNACAFQQRqIQUCfyAARQRAIAMgB0ECdGpBCjYCAEEADAELIAIgB0EDdGooAgALDAELIBANBiAFQQJqIQVBACAARQ0AGiABIAEoAgAiB0EEajYCACAHKAIACyEIIAYgBTYCPCAIQQBODAELIAYgBUEBajYCPCAGQTxqEAchCCAGKAI8IQVBAQshEQNAIAQhEkEcIQcgBSITLAAAIgRB+wBrQUZJDQsgBUEBaiEFIAQgEkE6bGotAN8HIgRBAWtB/wFxQQhJDQALIAYgBTYCPAJAIARBG0cEQCAERQ0MIA5BAE4EQCAARQRAIAMgDkECdGogBDYCAAwMCyAGIAIgDkEDdGopAwA3AzAMAgsgAEUNCCAGQTBqIAQgARAIDAELIA5BAE4NC0EAIQQgAEUNCAsgAC0AAEEgcQ0LIAtB//97cSIKIAsgC0GAwABxGyELQQAhDkGKCCEUIA8hBwJAAkACfwJAAkACQAJAAkACQAJ/AkACQAJAAkACQAJAAkAgEy0AACITwCIEQVNxIAQgE0EPcUEDRhsgBCASGyIEQdgAaw4hBBYWFhYWFhYWEBYJBhAQEBYGFhYWFgIFAxYWChYBFhYEAAsCQCAEQcEAaw4HEBYLFhAQEAALIARB0wBGDQsMFQsgBikDMCEYQYoIDAULQQAhBAJAAkACQAJAAkACQAJAIBIOCAABAgMEHAUGHAsgBigCMCAMNgIADBsLIAYoAjAgDDYCAAwaCyAGKAIwIAysNwMADBkLIAYoAjAgDDsBAAwYCyAGKAIwIAw6AAAMFwsgBigCMCAMNgIADBYLIAYoAjAgDKw3AwAMFQtBCCAIIAhBCE0bIQggC0EIciELQfgAIQQLIA8hCSAGKQMwIhgiF0IAUgRAIARBIHEhBQNAIAlBAWsiCSAXp0EPcUHwC2otAAAgBXI6AAAgF0IPViEKIBdCBIghFyAKDQALCyAYUA0DIAtBCHFFDQMgBEEEdkGKCGohFEECIQ4MAwsgDyEEIAYpAzAiGCIXQgBSBEADQCAEQQFrIgQgF6dBB3FBMHI6AAAgF0IHViEJIBdCA4ghFyAJDQALCyAEIQkgC0EIcUUNAiAIIA8gBGsiBEEBaiAEIAhIGyEIDAILIAYpAzAiGEIAUwRAIAZCACAYfSIYNwMwQQEhDkGKCAwBCyALQYAQcQRAQQEhDkGLCAwBC0GMCEGKCCALQQFxIg4bCyEUIA8hBQJAIBgiGUKAgICAEFQEQCAYIRcMAQsDQCAFQQFrIgUgGSAZQgqAIhdCCn59p0EwcjoAACAZQv////+fAVYhBCAXIRkgBA0ACwsgF0IAUgRAIBenIQkDQCAFQQFrIgUgCSAJQQpuIgRBCmxrQTByOgAAIAlBCUshCiAEIQkgCg0ACwsgBSEJCyARIAhBAEhxDREgC0H//3txIAsgERshCwJAIBhCAFINACAIDQAgDyEJQQAhCAwOCyAIIBhQIA8gCWtqIgQgBCAISBshCAwNCyAGLQAwIQQMCwsCf0H/////ByAIIAhB/////wdPGyILIgVBAEchBwJAAkACQCAGKAIwIgRBlwggBBsiCSIEQQNxRQ0AIAVFDQADQCAELQAARQ0CIAVBAWsiBUEARyEHIARBAWoiBEEDcUUNASAFDQALCyAHRQ0BAkAgBC0AAEUNACAFQQRJDQADQEGAgoQIIAQoAgAiB2sgB3JBgIGChHhxQYCBgoR4Rw0CIARBBGohBCAFQQRrIgVBA0sNAAsLIAVFDQELA0AgBCAELQAARQ0CGiAEQQFqIQQgBUEBayIFDQALC0EACyIEIAlrIAsgBBsiBCAJaiEHIAhBAE4EQCAKIQsgBCEIDAwLIAohCyAEIQggBy0AAA0PDAsLIAYpAzAiF0IAUg0BQQAhBAwJCyAIBEAgBigCMAwCC0EAIQQgAEEgIA1BACALEAkMAgsgBkEANgIMIAYgFz4CCCAGIAZBCGoiBDYCMEF/IQggBAshCkEAIQQDQAJAIAooAgAiCUUNACAGQQRqIAkQCyIJQQBIDQ8gCSAIIARrSw0AIApBBGohCiAEIAlqIgQgCEkNAQsLQT0hByAEQQBIDQwgAEEgIA0gBCALEAkgBEUEQEEAIQQMAQtBACEHIAYoAjAhCgNAIAooAgAiCUUNASAGQQRqIgggCRALIgkgB2oiByAESw0BIAAgCCAJEAYgCkEEaiEKIAQgB0sNAAsLIABBICANIAQgC0GAwABzEAkgDSAEIAQgDUgbIQQMCAsgESAIQQBIcQ0JQT0hByAGKwMwGgALIAQtAAEhCiAEQQFqIQQMAAsACyAADQkgEEUNA0EBIQQDQCADIARBAnRqKAIAIgAEQCACIARBA3RqIAAgARAIQQEhDCAEQQFqIgRBCkcNAQwLCwsgBEEKTwRAQQEhDAwKCwNAIAMgBEECdGooAgANAUEBIQwgBEEBaiIEQQpHDQALDAkLQRwhBwwGCyAGIAQ6ACdBASEIIBUhCSAKIQsLIAggByAJayIKIAggCkobIgggDkH/////B3NKDQNBPSEHIA0gCCAOaiIFIAUgDUgbIgQgFkoNBCAAQSAgBCAFIAsQCSAAIBQgDhAGIABBMCAEIAUgC0GAgARzEAkgAEEwIAggCkEAEAkgACAJIAoQBiAAQSAgBCAFIAtBgMAAcxAJIAYoAjwhBQwBCwsLQQAhDAwDC0E9IQcLQZQNIAc2AgALQX8hDAsgBkFAayQAIAwLwAEBA38gAC0AAEEgcUUEQAJAIAAoAhAiAwR/IAMFIAAQBA0BIAAoAhALIAAoAhQiBGsgAkkEQCAAIAEgAiAAKAIkEQAAGgwBCwJAAkAgACgCUEEASA0AIAJFDQAgAiEDA0AgASADaiIFQQFrLQAAQQpHBEAgA0EBayIDDQEMAgsLIAAgASADIAAoAiQRAAAgA0kNAiACIANrIQIgACgCFCEEDAELIAEhBQsgBCAFIAIQAyAAIAAoAhQgAmo2AhQLCwtzAQV/IAAoAgAiAywAAEEwayIBQQlLBEBBAA8LA0BBfyEEIAJBzJmz5gBNBEBBfyABIAJBCmwiBWogASAFQf////8Hc0sbIQQLIAAgA0EBaiIFNgIAIAMsAAEhASAEIQIgBSEDIAFBMGsiAUEKSQ0ACyACC7QCAAJAAkACQAJAAkACQAJAAkACQAJAAkAgAUEJaw4SAAgJCggJAQIDBAoJCgoICQUGBwsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsACw8LIAIgAigCACIBQQRqNgIAIAAgATQCADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATUCADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASkDADcDAAvQAwIEfwF+IwBBgAJrIgYkAAJAIAIgA0wNACAEQYDABHENAAJAIAIgA2siA0GAAiADQYACSSIEGyIIRQ0AIAYgAToAACAGIAhqIgJBAWsgAToAACAIQQNJDQAgBiABOgACIAYgAToAASACQQNrIAE6AAAgAkECayABOgAAIAhBB0kNACAGIAE6AAMgAkEEayABOgAAIAhBCUkNACAGQQAgBmtBA3EiAmoiByABQf8BcUGBgoQIbCIFNgIAIAcgCCACa0F8cSIBaiICQQRrIAU2AgAgAUEJSQ0AIAcgBTYCCCAHIAU2AgQgAkEIayAFNgIAIAJBDGsgBTYCACABQRlJDQAgByAFNgIYIAcgBTYCFCAHIAU2AhAgByAFNgIMIAJBEGsgBTYCACACQRRrIAU2AgAgAkEYayAFNgIAIAJBHGsgBTYCACABIAdBBHFBGHIiAWsiAkEgSQ0AIAWtQoGAgIAQfiEJIAEgB2ohAQNAIAEgCTcDGCABIAk3AxAgASAJNwMIIAEgCTcDACABQSBqIQEgAkEgayICQR9LDQALCyAERQRAA0AgACAGQYACEAYgA0GAAmsiA0H/AUsNAAsLIAAgBiADEAYLIAZBgAJqJAALpgEBBX8gACgCVCIDKAIAIQUgAygCBCIEIAAoAhQgACgCHCIHayIGIAQgBkkbIgYEQCAFIAcgBhADIAMgAygCACAGaiIFNgIAIAMgAygCBCAGayIENgIECyAEIAIgAiAESxsiBARAIAUgASAEEAMgAyADKAIAIARqIgU2AgAgAyADKAIEIARrNgIECyAFQQA6AAAgACAAKAIsIgE2AhwgACABNgIUIAILlwIAIABFBEBBAA8LAn8CQCAABH8gAUH/AE0NAQJAQbAOKAIAKAIARQRAIAFBgH9xQYC/A0YNAwwBCyABQf8PTQRAIAAgAUE/cUGAAXI6AAEgACABQQZ2QcABcjoAAEECDAQLIAFBgEBxQYDAA0cgAUGAsANPcUUEQCAAIAFBP3FBgAFyOgACIAAgAUEMdkHgAXI6AAAgACABQQZ2QT9xQYABcjoAAUEDDAQLIAFBgIAEa0H//z9NBEAgACABQT9xQYABcjoAAyAAIAFBEnZB8AFyOgAAIAAgAUEGdkE/cUGAAXI6AAIgACABQQx2QT9xQYABcjoAAUEEDAQLC0GUDUEZNgIAQX8FQQELDAELIAAgAToAAEEBCwveJwELfyMAQRBrIgokAAJAAkACQAJAAkACQAJAAkACQAJAIABB9AFNBEBB1A4oAgAiBEEQIABBC2pB+ANxIABBC0kbIgZBA3YiAHYiAUEDcQRAAkAgAUF/c0EBcSAAaiICQQN0IgFB/A5qIgAgAUGED2ooAgAiASgCCCIFRgRAQdQOIARBfiACd3E2AgAMAQsgBSAANgIMIAAgBTYCCAsgAUEIaiEAIAEgAkEDdCICQQNyNgIEIAEgAmoiASABKAIEQQFyNgIEDAsLIAZB3A4oAgAiCE0NASABBEACQEECIAB0IgJBACACa3IgASAAdHFoIgFBA3QiAEH8DmoiAiAAQYQPaigCACIAKAIIIgVGBEBB1A4gBEF+IAF3cSIENgIADAELIAUgAjYCDCACIAU2AggLIAAgBkEDcjYCBCAAIAZqIgcgAUEDdCIBIAZrIgVBAXI2AgQgACABaiAFNgIAIAgEQCAIQXhxQfwOaiEBQegOKAIAIQICfyAEQQEgCEEDdnQiA3FFBEBB1A4gAyAEcjYCACABDAELIAEoAggLIQMgASACNgIIIAMgAjYCDCACIAE2AgwgAiADNgIICyAAQQhqIQBB6A4gBzYCAEHcDiAFNgIADAsLQdgOKAIAIgtFDQEgC2hBAnRBhBFqKAIAIgIoAgRBeHEgBmshAyACIQEDQAJAIAEoAhAiAEUEQCABKAIUIgBFDQELIAAoAgRBeHEgBmsiASADIAEgA0kiARshAyAAIAIgARshAiAAIQEMAQsLIAIoAhghCSACIAIoAgwiAEcEQCACKAIIIgEgADYCDCAAIAE2AggMCgsgAigCFCIBBH8gAkEUagUgAigCECIBRQ0DIAJBEGoLIQUDQCAFIQcgASIAQRRqIQUgACgCFCIBDQAgAEEQaiEFIAAoAhAiAQ0ACyAHQQA2AgAMCQtBfyEGIABBv39LDQAgAEELaiIBQXhxIQZB2A4oAgAiB0UNAEEfIQhBACAGayEDIABB9P//B00EQCAGQSYgAUEIdmciAGt2QQFxIABBAXRrQT5qIQgLAkACQAJAIAhBAnRBhBFqKAIAIgFFBEBBACEADAELQQAhACAGQRkgCEEBdmtBACAIQR9HG3QhAgNAAkAgASgCBEF4cSAGayIEIANPDQAgASEFIAQiAw0AQQAhAyABIQAMAwsgACABKAIUIgQgBCABIAJBHXZBBHFqKAIQIgFGGyAAIAQbIQAgAkEBdCECIAENAAsLIAAgBXJFBEBBACEFQQIgCHQiAEEAIABrciAHcSIARQ0DIABoQQJ0QYQRaigCACEACyAARQ0BCwNAIAAoAgRBeHEgBmsiAiADSSEBIAIgAyABGyEDIAAgBSABGyEFIAAoAhAiAQR/IAEFIAAoAhQLIgANAAsLIAVFDQAgA0HcDigCACAGa08NACAFKAIYIQggBSAFKAIMIgBHBEAgBSgCCCIBIAA2AgwgACABNgIIDAgLIAUoAhQiAQR/IAVBFGoFIAUoAhAiAUUNAyAFQRBqCyECA0AgAiEEIAEiAEEUaiECIAAoAhQiAQ0AIABBEGohAiAAKAIQIgENAAsgBEEANgIADAcLIAZB3A4oAgAiBU0EQEHoDigCACEAAkAgBSAGayIBQRBPBEAgACAGaiICIAFBAXI2AgQgACAFaiABNgIAIAAgBkEDcjYCBAwBCyAAIAVBA3I2AgQgACAFaiIBIAEoAgRBAXI2AgRBACECQQAhAQtB3A4gATYCAEHoDiACNgIAIABBCGohAAwJCyAGQeAOKAIAIgJJBEBB4A4gAiAGayIBNgIAQewOQewOKAIAIgAgBmoiAjYCACACIAFBAXI2AgQgACAGQQNyNgIEIABBCGohAAwJC0EAIQAgBkEvaiIDAn9BrBIoAgAEQEG0EigCAAwBC0G4EkJ/NwIAQbASQoCggICAgAQ3AgBBrBIgCkEMakFwcUHYqtWqBXM2AgBBwBJBADYCAEGQEkEANgIAQYAgCyIBaiIEQQAgAWsiB3EiASAGTQ0IQYwSKAIAIgUEQEGEEigCACIIIAFqIgkgCE0NCSAFIAlJDQkLAkBBkBItAABBBHFFBEACQAJAAkACQEHsDigCACIFBEBBlBIhAANAIAAoAgAiCCAFTQRAIAUgCCAAKAIEakkNAwsgACgCCCIADQALC0EAEA4iAkF/Rg0DIAEhBEGwEigCACIAQQFrIgUgAnEEQCABIAJrIAIgBWpBACAAa3FqIQQLIAQgBk0NA0GMEigCACIABEBBhBIoAgAiBSAEaiIHIAVNDQQgACAHSQ0ECyAEEA4iACACRw0BDAULIAQgAmsgB3EiBBAOIgIgACgCACAAKAIEakYNASACIQALIABBf0YNASAGQTBqIARNBEAgACECDAQLQbQSKAIAIgIgAyAEa2pBACACa3EiAhAOQX9GDQEgAiAEaiEEIAAhAgwDCyACQX9HDQILQZASQZASKAIAQQRyNgIACyABEA4hAkEAEA4hACACQX9GDQUgAEF/Rg0FIAAgAk0NBSAAIAJrIgQgBkEoak0NBQtBhBJBhBIoAgAgBGoiADYCAEGIEigCACAASQRAQYgSIAA2AgALAkBB7A4oAgAiAwRAQZQSIQADQCACIAAoAgAiASAAKAIEIgVqRg0CIAAoAggiAA0ACwwEC0HkDigCACIAQQAgACACTRtFBEBB5A4gAjYCAAtBACEAQZgSIAQ2AgBBlBIgAjYCAEH0DkF/NgIAQfgOQawSKAIANgIAQaASQQA2AgADQCAAQQN0IgFBhA9qIAFB/A5qIgU2AgAgAUGID2ogBTYCACAAQQFqIgBBIEcNAAtB4A4gBEEoayIAQXggAmtBB3EiAWsiBTYCAEHsDiABIAJqIgE2AgAgASAFQQFyNgIEIAAgAmpBKDYCBEHwDkG8EigCADYCAAwECyACIANNDQIgASADSw0CIAAoAgxBCHENAiAAIAQgBWo2AgRB7A4gA0F4IANrQQdxIgBqIgE2AgBB4A5B4A4oAgAgBGoiAiAAayIANgIAIAEgAEEBcjYCBCACIANqQSg2AgRB8A5BvBIoAgA2AgAMAwtBACEADAYLQQAhAAwEC0HkDigCACACSwRAQeQOIAI2AgALIAIgBGohBUGUEiEAAkADQCAFIAAoAgAiAUcEQCAAKAIIIgANAQwCCwsgAC0ADEEIcUUNAwtBlBIhAANAAkAgACgCACIBIANNBEAgAyABIAAoAgRqIgVJDQELIAAoAgghAAwBCwtB4A4gBEEoayIAQXggAmtBB3EiAWsiBzYCAEHsDiABIAJqIgE2AgAgASAHQQFyNgIEIAAgAmpBKDYCBEHwDkG8EigCADYCACADIAVBJyAFa0EHcWpBL2siACAAIANBEGpJGyIBQRs2AgQgAUGcEikCADcCECABQZQSKQIANwIIQZwSIAFBCGo2AgBBmBIgBDYCAEGUEiACNgIAQaASQQA2AgAgAUEYaiEAA0AgAEEHNgIEIABBCGohAiAAQQRqIQAgAiAFSQ0ACyABIANGDQAgASABKAIEQX5xNgIEIAMgASADayICQQFyNgIEIAEgAjYCAAJ/IAJB/wFNBEAgAkF4cUH8DmohAAJ/QdQOKAIAIgFBASACQQN2dCICcUUEQEHUDiABIAJyNgIAIAAMAQsgACgCCAshASAAIAM2AgggASADNgIMQQwhAkEIDAELQR8hACACQf///wdNBEAgAkEmIAJBCHZnIgBrdkEBcSAAQQF0a0E+aiEACyADIAA2AhwgA0IANwIQIABBAnRBhBFqIQECQAJAQdgOKAIAIgVBASAAdCIEcUUEQEHYDiAEIAVyNgIAIAEgAzYCAAwBCyACQRkgAEEBdmtBACAAQR9HG3QhACABKAIAIQUDQCAFIgEoAgRBeHEgAkYNAiAAQR12IQUgAEEBdCEAIAEgBUEEcWoiBCgCECIFDQALIAQgAzYCEAsgAyABNgIYQQghAiADIgEhAEEMDAELIAEoAggiACADNgIMIAEgAzYCCCADIAA2AghBACEAQRghAkEMCyADaiABNgIAIAIgA2ogADYCAAtB4A4oAgAiACAGTQ0AQeAOIAAgBmsiATYCAEHsDkHsDigCACIAIAZqIgI2AgAgAiABQQFyNgIEIAAgBkEDcjYCBCAAQQhqIQAMBAtBlA1BMDYCAEEAIQAMAwsgACACNgIAIAAgACgCBCAEajYCBCACQXggAmtBB3FqIgggBkEDcjYCBCABQXggAWtBB3FqIgQgBiAIaiIDayEHAkBB7A4oAgAgBEYEQEHsDiADNgIAQeAOQeAOKAIAIAdqIgA2AgAgAyAAQQFyNgIEDAELQegOKAIAIARGBEBB6A4gAzYCAEHcDkHcDigCACAHaiIANgIAIAMgAEEBcjYCBCAAIANqIAA2AgAMAQsgBCgCBCIAQQNxQQFGBEAgAEF4cSEJIAQoAgwhAgJAIABB/wFNBEAgBCgCCCIBIAJGBEBB1A5B1A4oAgBBfiAAQQN2d3E2AgAMAgsgASACNgIMIAIgATYCCAwBCyAEKAIYIQYCQCACIARHBEAgBCgCCCIAIAI2AgwgAiAANgIIDAELAkAgBCgCFCIABH8gBEEUagUgBCgCECIARQ0BIARBEGoLIQEDQCABIQUgACICQRRqIQEgACgCFCIADQAgAkEQaiEBIAIoAhAiAA0ACyAFQQA2AgAMAQtBACECCyAGRQ0AAkAgBCgCHCIAQQJ0QYQRaiIBKAIAIARGBEAgASACNgIAIAINAUHYDkHYDigCAEF+IAB3cTYCAAwCCwJAIAQgBigCEEYEQCAGIAI2AhAMAQsgBiACNgIUCyACRQ0BCyACIAY2AhggBCgCECIABEAgAiAANgIQIAAgAjYCGAsgBCgCFCIARQ0AIAIgADYCFCAAIAI2AhgLIAcgCWohByAEIAlqIgQoAgQhAAsgBCAAQX5xNgIEIAMgB0EBcjYCBCADIAdqIAc2AgAgB0H/AU0EQCAHQXhxQfwOaiEAAn9B1A4oAgAiAUEBIAdBA3Z0IgJxRQRAQdQOIAEgAnI2AgAgAAwBCyAAKAIICyEBIAAgAzYCCCABIAM2AgwgAyAANgIMIAMgATYCCAwBC0EfIQIgB0H///8HTQRAIAdBJiAHQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAgsgAyACNgIcIANCADcCECACQQJ0QYQRaiEAAkACQEHYDigCACIBQQEgAnQiBXFFBEBB2A4gASAFcjYCACAAIAM2AgAMAQsgB0EZIAJBAXZrQQAgAkEfRxt0IQIgACgCACEBA0AgASIAKAIEQXhxIAdGDQIgAkEddiEBIAJBAXQhAiAAIAFBBHFqIgUoAhAiAQ0ACyAFIAM2AhALIAMgADYCGCADIAM2AgwgAyADNgIIDAELIAAoAggiASADNgIMIAAgAzYCCCADQQA2AhggAyAANgIMIAMgATYCCAsgCEEIaiEADAILAkAgCEUNAAJAIAUoAhwiAUECdEGEEWoiAigCACAFRgRAIAIgADYCACAADQFB2A4gB0F+IAF3cSIHNgIADAILAkAgBSAIKAIQRgRAIAggADYCEAwBCyAIIAA2AhQLIABFDQELIAAgCDYCGCAFKAIQIgEEQCAAIAE2AhAgASAANgIYCyAFKAIUIgFFDQAgACABNgIUIAEgADYCGAsCQCADQQ9NBEAgBSADIAZqIgBBA3I2AgQgACAFaiIAIAAoAgRBAXI2AgQMAQsgBSAGQQNyNgIEIAUgBmoiBCADQQFyNgIEIAMgBGogAzYCACADQf8BTQRAIANBeHFB/A5qIQACf0HUDigCACIBQQEgA0EDdnQiAnFFBEBB1A4gASACcjYCACAADAELIAAoAggLIQEgACAENgIIIAEgBDYCDCAEIAA2AgwgBCABNgIIDAELQR8hACADQf///wdNBEAgA0EmIANBCHZnIgBrdkEBcSAAQQF0a0E+aiEACyAEIAA2AhwgBEIANwIQIABBAnRBhBFqIQECQAJAIAdBASAAdCICcUUEQEHYDiACIAdyNgIAIAEgBDYCACAEIAE2AhgMAQsgA0EZIABBAXZrQQAgAEEfRxt0IQAgASgCACEBA0AgASICKAIEQXhxIANGDQIgAEEddiEBIABBAXQhACACIAFBBHFqIgcoAhAiAQ0ACyAHIAQ2AhAgBCACNgIYCyAEIAQ2AgwgBCAENgIIDAELIAIoAggiACAENgIMIAIgBDYCCCAEQQA2AhggBCACNgIMIAQgADYCCAsgBUEIaiEADAELAkAgCUUNAAJAIAIoAhwiAUECdEGEEWoiBSgCACACRgRAIAUgADYCACAADQFB2A4gC0F+IAF3cTYCAAwCCwJAIAIgCSgCEEYEQCAJIAA2AhAMAQsgCSAANgIUCyAARQ0BCyAAIAk2AhggAigCECIBBEAgACABNgIQIAEgADYCGAsgAigCFCIBRQ0AIAAgATYCFCABIAA2AhgLAkAgA0EPTQRAIAIgAyAGaiIAQQNyNgIEIAAgAmoiACAAKAIEQQFyNgIEDAELIAIgBkEDcjYCBCACIAZqIgUgA0EBcjYCBCADIAVqIAM2AgAgCARAIAhBeHFB/A5qIQBB6A4oAgAhAQJ/QQEgCEEDdnQiByAEcUUEQEHUDiAEIAdyNgIAIAAMAQsgACgCCAshBCAAIAE2AgggBCABNgIMIAEgADYCDCABIAQ2AggLQegOIAU2AgBB3A4gAzYCAAsgAkEIaiEACyAKQRBqJAAgAAvcCwEIfwJAIABFDQAgAEEIayIDIABBBGsoAgAiAkF4cSIAaiEFAkAgAkEBcQ0AIAJBAnFFDQEgAyADKAIAIgRrIgNB5A4oAgBJDQEgACAEaiEAAkACQAJAQegOKAIAIANHBEAgAygCDCEBIARB/wFNBEAgASADKAIIIgJHDQJB1A5B1A4oAgBBfiAEQQN2d3E2AgAMBQsgAygCGCEHIAEgA0cEQCADKAIIIgIgATYCDCABIAI2AggMBAsgAygCFCICBH8gA0EUagUgAygCECICRQ0DIANBEGoLIQQDQCAEIQYgAiIBQRRqIQQgASgCFCICDQAgAUEQaiEEIAEoAhAiAg0ACyAGQQA2AgAMAwsgBSgCBCICQQNxQQNHDQNB3A4gADYCACAFIAJBfnE2AgQgAyAAQQFyNgIEIAUgADYCAA8LIAIgATYCDCABIAI2AggMAgtBACEBCyAHRQ0AAkAgAygCHCIEQQJ0QYQRaiICKAIAIANGBEAgAiABNgIAIAENAUHYDkHYDigCAEF+IAR3cTYCAAwCCwJAIAMgBygCEEYEQCAHIAE2AhAMAQsgByABNgIUCyABRQ0BCyABIAc2AhggAygCECICBEAgASACNgIQIAIgATYCGAsgAygCFCICRQ0AIAEgAjYCFCACIAE2AhgLIAMgBU8NACAFKAIEIgRBAXFFDQACQAJAAkACQCAEQQJxRQRAQewOKAIAIAVGBEBB7A4gAzYCAEHgDkHgDigCACAAaiIANgIAIAMgAEEBcjYCBCADQegOKAIARw0GQdwOQQA2AgBB6A5BADYCAA8LQegOKAIAIgcgBUYEQEHoDiADNgIAQdwOQdwOKAIAIABqIgA2AgAgAyAAQQFyNgIEIAAgA2ogADYCAA8LIARBeHEgAGohACAFKAIMIQEgBEH/AU0EQCAFKAIIIgIgAUYEQEHUDkHUDigCAEF+IARBA3Z3cTYCAAwFCyACIAE2AgwgASACNgIIDAQLIAUoAhghCCABIAVHBEAgBSgCCCICIAE2AgwgASACNgIIDAMLIAUoAhQiAgR/IAVBFGoFIAUoAhAiAkUNAiAFQRBqCyEEA0AgBCEGIAIiAUEUaiEEIAEoAhQiAg0AIAFBEGohBCABKAIQIgINAAsgBkEANgIADAILIAUgBEF+cTYCBCADIABBAXI2AgQgACADaiAANgIADAMLQQAhAQsgCEUNAAJAIAUoAhwiBEECdEGEEWoiAigCACAFRgRAIAIgATYCACABDQFB2A5B2A4oAgBBfiAEd3E2AgAMAgsCQCAFIAgoAhBGBEAgCCABNgIQDAELIAggATYCFAsgAUUNAQsgASAINgIYIAUoAhAiAgRAIAEgAjYCECACIAE2AhgLIAUoAhQiAkUNACABIAI2AhQgAiABNgIYCyADIABBAXI2AgQgACADaiAANgIAIAMgB0cNAEHcDiAANgIADwsgAEH/AU0EQCAAQXhxQfwOaiECAn9B1A4oAgAiBEEBIABBA3Z0IgBxRQRAQdQOIAAgBHI2AgAgAgwBCyACKAIICyEAIAIgAzYCCCAAIAM2AgwgAyACNgIMIAMgADYCCA8LQR8hASAAQf///wdNBEAgAEEmIABBCHZnIgJrdkEBcSACQQF0a0E+aiEBCyADIAE2AhwgA0IANwIQIAFBAnRBhBFqIQQCfwJAAn9B2A4oAgAiBkEBIAF0IgJxRQRAQdgOIAIgBnI2AgAgBCADNgIAQRghAUEIDAELIABBGSABQQF2a0EAIAFBH0cbdCEBIAQoAgAhBANAIAQiAigCBEF4cSAARg0CIAFBHXYhBCABQQF0IQEgAiAEQQRxaiIGKAIQIgQNAAsgBiADNgIQQRghASACIQRBCAshACADIgIMAQsgAigCCCIEIAM2AgwgAiADNgIIQRghAEEIIQFBAAshBiABIANqIAQ2AgAgAyACNgIMIAAgA2ogBjYCAEH0DkH0DigCAEEBayIAQX8gABs2AgALC0kBAn9BkA0oAgAiASAAQQdqQXhxIgJqIQACQCACQQAgACABTRtFBEAgAD8AQRB0TQ0BC0GUDUEwNgIAQX8PC0GQDSAANgIAIAELBgAgACQACwQAIwALC4YDEABBgAgLYTAxMjM0NTY3ODktKyAgIDBYMHgAJWQAKG51bGwpAAAAGQALABkZGQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAAZAAoKGRkZAwoHAAEACQsYAAAJBgsAAAsABhkAAAAZGRkAQfEICyEOAAAAAAAAAAAZAAsNGRkZAA0AAAIACQ4AAAAJAA4AAA4AQasJCwEMAEG3CQsVEwAAAAATAAAAAAkMAAAAAAAMAAAMAEHlCQsBEABB8QkLFQ8AAAAEDwAAAAAJEAAAAAAAEAAAEABBnwoLARIAQasKCx4RAAAAABEAAAAACRIAAAAAABIAABIAABoAAAAaGhoAQeIKCw4aAAAAGhoaAAAAAAAACQBBkwsLARQAQZ8LCxUXAAAAABcAAAAACRQAAAAAABQAABQAQc0LCwEWAEHZCwsnFQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVGAEGkDAsBAgBBzAwLCP//////////AEGQDQsDUAkB";
function cleanText(raw) {
    if (!raw) return "";
    return raw.replace(/<\/?pre[^>]*>/gi, "").trim();
}

function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function generateTOCNav(toc) {
    function buildTOC(items) {
        return `<ol>` + items.map(item => {
            let cleanTitle = escapeXML(item.title);
            let pageFilename = `page${item.page - 1}.xhtml`;

            return `
            <li><a href="${pageFilename}">${cleanTitle}</a>
                ${item.subitems.length ? buildTOC(item.subitems) : ""}
            </li>`;
        }).join("") + `</ol>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>Оглавление</title>
    </head>
    <body>
        <nav epub:type="toc" id="toc">
            <h2>Оглавление</h2>
            ${buildTOC(toc)}
        </nav>
    </body>
    </html>`;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function blobToDataURL(blob) {
  try {
    const fr = new FileReader();
    const p = new Promise((res, rej) => {
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
    });
    fr.readAsDataURL(blob);
    return await p;
  } catch {
    const buf = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return "data:image/png;base64," + btoa(binary);
  }
}

async function webpDataURLtoPngDataURL(dataURL) {
  const b64 = dataURL.split(",")[1];
  const bytes = base64ToBytes(b64);
  const bmp = await createImageBitmap(new Blob([bytes], { type: "image/webp" }));
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const pngBlob = await canvas.convertToBlob({ type: "image/png" });
  return await blobToDataURL(pngBlob);
}

async function convertWebPImagesInSVG(svgText) {
  const dataUrlRegex = /(<image[^>]+(?:href|xlink:href)\s*=\s*")[^"]+(")/gi;
  const hrefs = [];
  let match;
  while ((match = dataUrlRegex.exec(svgText))) {
    hrefs.push({ start: match.index + match[1].length, end: dataUrlRegex.lastIndex - match[2].length });
  }

  const slices = hrefs.map(({ start, end }) => svgText.slice(start, end));
  const unique = [...new Set(slices)];

  const replacements = new Map();
  for (const url of unique) {
    try {
      if (url.startsWith("data:image/webp")) {
        const pngUrl = await webpDataURLtoPngDataURL(url);
        replacements.set(url, pngUrl);
      } else if (/\.webp(\?|#|$)/i.test(url)) {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const bmp = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        const pngBlob = await canvas.convertToBlob({ type: "image/png" });
        const pngDataURL = await blobToDataURL(pngBlob);
        replacements.set(url, pngDataURL);
      }
    } catch (e) {}
  }

  if (replacements.size === 0) return svgText;

  let out = svgText;
  for (const [from, to] of replacements.entries()) {
    out = out.split(from).join(to);
  }
  return out;
}

let epubZip, epubFolder, epubPages = [], epubBookId, epubTitle, epubAuthor, epubTOC;

async function finalizeEPUB() {
    try {
        epubZip.file("mimetype", "application/epub+zip", { compression: "STORE" });
        const tocNav = epubTOC ? generateTOCNav(epubTOC) : "";
        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
        <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
            <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:title>${escapeXML(epubTitle)}</dc:title>
                <dc:creator>${escapeXML(epubAuthor)}</dc:creator>
                <dc:identifier id="bookid">${escapeXML(epubBookId)}</dc:identifier>
                <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]+"Z"}</meta>
            </metadata>
            <manifest>
                ${epubTOC ? '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>' : ""}
                ${epubPages.map((_, i) => `<item id="page${i}" href="page${i}.xhtml" media-type="application/xhtml+xml"/>`).join("\n")}
            </manifest>
            <spine>
                ${epubPages.map((_, i) => `<itemref idref="page${i}"/>`).join("\n")}
            </spine>
        </package>`;

        epubFolder.file("content.opf", contentOpf);
        if (epubTOC) epubFolder.file("nav.xhtml", tocNav);

        epubPages.forEach((text, i) => {
            const pageXHTML = `<?xml version="1.0" encoding="UTF-8"?>
            <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <title>${escapeXML(epubTitle)} - Page ${i + 1}</title>
                    <style>
                        body { font-family: serif; line-height: 1.2; margin: 1em; text-align: justify; }
                        p { margin: 0 0 0em 0; }
                    </style>
                </head>
                <body>
                    ${escapeXML(cleanText(text))
                        .split(/\n+/g)
                        .map(line => `<p>${line.trim()}</p>`)
                        .join("\n")}
                </body>
            </html>`;
            epubFolder.file(`page${i}.xhtml`, pageXHTML);
        });

        epubZip.folder("META-INF").file("container.xml", `<?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
            <rootfiles>
                <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
            </rootfiles>
        </container>`);

        const blob = await epubZip.generateAsync({ 
            type: "blob", 
            mimeType: "application/epub+zip",
            compression: "STORE"
        });
        
        self.postMessage({ action: "done", blob });
    } catch (err) {
        console.error(err);
        self.postMessage({ action: "error", error: err.message || String(err) });
    }
}

let wasm;
let doc, stream;
let wasmUrl = null;
let wasmBuffer = null;

function getMemory() {
    return new Uint8Array(wasm.memory.buffer);
}

async function loadDecryptWASM() {
    if (wasm) return wasm;
    let buf = (wasmBuffer && wasmBuffer.byteLength > 0) ? wasmBuffer : null;
    if (!buf && typeof DECRYPT_SVG_WASM_BASE64 !== "undefined") {
        buf = base64ToBytes(DECRYPT_SVG_WASM_BASE64).buffer;
    }
    if (!buf && wasmUrl) {
        const resp = await fetch(wasmUrl);
        buf = await resp.arrayBuffer();
    }
    if (!buf || buf.byteLength === 0) {
        throw new Error("Пустой или отсутствующий буфер для WASM");
    }
    const { instance } = await WebAssembly.instantiate(buf, {
        env: { emscripten_notify_memory_growth: () => {} }
    });
    wasm = instance.exports;
    if (!wasm.memory) {
        console.error("WASM-модуль не экспортирует память");
    }
    return wasm;
}

function wasmStringToJS(ptr) {
    let str = "";
    const mem = getMemory();
    while (mem[ptr] !== 0) {
        str += String.fromCharCode(mem[ptr++]);
    }
    return str;
}

function stringToWasm(str) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str + "\0");
    const ptr = wasm.malloc(encoded.length);
    const mem = getMemory();
    mem.set(encoded, ptr);
    return ptr;
}

function parseSVGDimensions(svgText) {
    const vbMatch = svgText.match(/viewBox\s*=\s*["']\s*([\d.+\-eE,\s]+)\s*["']/i);
    if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length >= 4 && !Number.isNaN(parts[2]) && !Number.isNaN(parts[3])) {
            return { width: parts[2], height: parts[3] };
        }
    }
    const wMatch = svgText.match(/<svg[^>]*\bwidth\s*=\s*["']\s*([0-9.+-eE]+)(?:px)?\s*["']/i);
    const hMatch = svgText.match(/<svg[^>]*\bheight\s*=\s*["']\s*([0-9.+-eE]+)(?:px)?\s*["']/i);
    if (wMatch && hMatch) {
        return { width: parseFloat(wMatch[1]), height: parseFloat(hMatch[1]) };
    }
    const anyVB = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (anyVB) {
        const parts = anyVB[1].trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length >= 4 && !Number.isNaN(parts[2]) && !Number.isNaN(parts[3])) {
            return { width: parts[2], height: parts[3] };
        }
    }
    console.error(`Ошибка при парсинге svg, используем дефолт А4`);
    return { width: 595, height: 842 };
}

async function handleMessage(e) {
    const { action } = e.data;

    try {
        if (action === "initEPUB") {
            epubZip = new JSZip();
            epubFolder = epubZip.folder("EPUB");
            epubBookId = e.data.bookId;
            epubTitle = e.data.bookTitle;
            epubAuthor = e.data.author;
            epubTOC = e.data.toc;
            epubPages = [];
            return;
        }

        if (action === "addPageEPUB") {
            epubPages.push(e.data.text);
            self.postMessage({ action: "pageAdded" });
            return;
        }

        if (action === "finalizeEPUB") {
            await finalizeEPUB();
            return;
        }

        if (action === "initPDF") {
            doc = new PDFDocument({ autoFirstPage: false });
            stream = doc.pipe(blobStream());
            wasmUrl = e.data.wasmUrl || null;
            wasmBuffer = e.data.wasmBuffer || null;
            return;
        }

        if (action === "addPagePDF") {
            if (!doc) throw new Error("PDF документ не инициализирован");
            const { svgData, key } = e.data;
            const wasm = await loadDecryptWASM();

            let ptrSvg = 0;
            let ptrKey = 0;
            let resultPtr = 0;
            let decryptedSVG;
            try {
                ptrSvg = stringToWasm(svgData);
                ptrKey = stringToWasm(key);
                resultPtr = wasm.decryptSVG(ptrSvg, ptrKey);
                decryptedSVG = wasmStringToJS(resultPtr);
            } finally {
                if (ptrSvg) wasm.free(ptrSvg);
                if (ptrKey) wasm.free(ptrKey);
                if (resultPtr) wasm.free(resultPtr);
            }

            decryptedSVG = await convertWebPImagesInSVG(decryptedSVG);

            const { width, height } = parseSVGDimensions(decryptedSVG);
            doc.addPage({ size: [width, height] });
            SVGtoPDF(doc, decryptedSVG, 0, 0, { preserveAspectRatio: "none" });

            self.postMessage({ action: "pageAdded" });
            return;
        }

        if (action === "finalizePDF") {
            if (!doc || !stream) {
                throw new Error("PDF документ не инициализирован");
            }
            stream.once("finish", async () => {
                const blob = stream.toBlob("application/pdf");
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    self.postMessage({ action: "done", buffer: arrayBuffer }, [arrayBuffer]);
                } catch {
                    self.postMessage({ action: "done", blob });
                }
            });
            doc.end();
            return;
        }
    } catch (err) {
        console.error(err);
        self.postMessage({ action: "error", error: err.message || String(err) });
    }
}

let messageQueue = Promise.resolve();

self.onmessage = (e) => {
    messageQueue = messageQueue
        .then(() => handleMessage(e))
        .catch(err => {
            console.error(err);
            self.postMessage({ action: "error", error: err.message || String(err) });
        });
};
