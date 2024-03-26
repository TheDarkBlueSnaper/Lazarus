from django import template

register = template.Library()


@register.filter(name='inicials')
def inicials(name):
    inicials = ''

    for word in name.split(' '):
        if name and len(inicials) < 3:
            inicials = name[0].upper()
    
    return inicials