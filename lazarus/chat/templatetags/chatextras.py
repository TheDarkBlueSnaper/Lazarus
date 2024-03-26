from django import template

register = template.Library()


@register.filter(name='initials')
def initials(name):
    initials = ''

    for name in name.split(' '):
        if name and len(initials) < 3:
            initials += name[0].upper()
    
    return initials