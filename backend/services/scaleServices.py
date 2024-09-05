class scaleServices:
    def __init__(self, npsScale, likertScale, npsLiteScale, stapelScale):
        self.npsScale = npsScale
        self.likertScale = likertScale
        self.npsLiteScale = npsLiteScale
        self.stapelScale = stapelScale

    def get_nps_scale(self):
        return f"Created NPS scale: {self.npsScale}"
    
    def get_likert_scale(self):
        return f"Created Likert scale: {self.likertScale}"
    
    def get_nps_lite_scale(self):
        return f"Created NPS Lite Scale: {self.npsLiteScale}"
    
    def get_stapel_scale(self):
        return f"Created Stapel Scale: {self.stapelScale}"